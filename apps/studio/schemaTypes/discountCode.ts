import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'discountCode',
  title: 'Discount Code',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Discount Code',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(20).uppercase(),
      description: 'Unique discount code (will be converted to uppercase)',
    }),
    defineField({
      name: 'name',
      title: 'Display Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Human-readable name for this discount',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Internal description of this discount code',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to enable/disable this discount code',
    }),
    defineField({
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          { title: 'All Apps', value: 'all_apps' },
          { title: 'Specific Apps', value: 'specific_apps' },
          { title: 'Minimum Total Amount', value: 'minimum_total' },
          { title: 'First Time Purchase', value: 'first_time' },
          { title: 'Bundle Discount', value: 'bundle' },
        ],
      },
      validation: (Rule) => Rule.required(),
      description: 'How this discount should be applied',
    }),
    defineField({
      name: 'valueType',
      title: 'Value Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage', value: 'percentage' },
          { title: 'Fixed Amount', value: 'fixed' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'percentage',
    }),
    defineField({
      name: 'value',
      title: 'Discount Value',
      type: 'number',
      validation: (Rule) => Rule.required().positive().custom((value, context) => {
        const parent = context.parent as any;
        if (parent?.valueType === 'percentage' && (value ?? 0) > 100) {
          return 'Percentage discount cannot exceed 100%';
        }
        return true;
      }),
      description: 'Discount amount (percentage or fixed amount in GHS)',
    }),
    defineField({
      name: 'applicableApps',
      title: 'Applicable Apps',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'premiumApp' }] }],
      hidden: ({ parent }) => parent?.discountType !== 'specific_apps' && parent?.discountType !== 'bundle',
      validation: (Rule) => Rule.custom((apps, context) => {
        const parent = context.parent as any;
        if ((parent?.discountType === 'specific_apps' || parent?.discountType === 'bundle') && (!apps || apps.length === 0)) {
          return 'Please select at least one app for this discount type';
        }
        return true;
      }),
      description: 'Select specific apps this discount applies to',
    }),
    defineField({
      name: 'minimumAmount',
      title: 'Minimum Total Amount (GHS)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
      hidden: ({ parent }) => parent?.discountType !== 'minimum_total',
      description: 'Minimum cart total required to apply this discount',
    }),
    defineField({
      name: 'minimumAppsCount',
      title: 'Minimum Apps Count',
      type: 'number',
      validation: (Rule) => Rule.positive().integer(),
      hidden: ({ parent }) => parent?.discountType !== 'bundle',
      description: 'Minimum number of selected apps required for bundle discount',
    }),
    defineField({
      name: 'maxDiscount',
      title: 'Maximum Discount Amount (GHS)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
      hidden: ({ parent }) => parent?.valueType !== 'percentage',
      description: 'Cap the maximum discount amount for percentage discounts',
    }),
    defineField({
      name: 'usageLimit',
      title: 'Usage Limit',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Usage Limit',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'totalUses',
          title: 'Total Uses Allowed',
          type: 'number',
          validation: (Rule) => Rule.positive().integer(),
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: 'perUserLimit',
          title: 'Per User Limit',
          type: 'number',
          validation: (Rule) => Rule.positive().integer(),
          hidden: ({ parent }) => !parent?.enabled,
          description: 'Maximum uses per user (optional)',
        }),
      ],
    }),
    defineField({
      name: 'validityPeriod',
      title: 'Validity Period',
      type: 'object',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
          validation: (Rule) => Rule.custom((endDate, context) => {
            const parent = context.parent as any;
            if (!endDate) return 'End date is required';
            if (parent?.startDate && new Date(endDate) <= new Date(parent.startDate)) {
              return 'End date must be after start date';
            }
            return true;
          }),
        }),
      ],
    }),
    defineField({
      name: 'stackable',
      title: 'Stackable with Promotions',
      type: 'boolean',
      initialValue: false,
      description: 'Allow this discount to be used with app promotions',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1).max(10),
      initialValue: 5,
      description: 'Priority when multiple discounts are applicable (1 = highest, 10 = lowest)',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'code',
      subtitle: 'name',
      discountType: 'discountType',
      value: 'value',
      valueType: 'valueType',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, subtitle, discountType, value, valueType, isActive } = selection;
      const discountValue = valueType === 'percentage' ? `${value}%` : `GHS${value}`;
      const status = isActive ? '🟢' : '🔴';
      return {
        title: `${status} ${title}`,
        subtitle: `${subtitle} - ${discountValue} (${discountType})`,
      };
    },
  },
  orderings: [
    {
      title: 'Code A-Z',
      name: 'codeAsc',
      by: [{ field: 'code', direction: 'asc' }],
    },
    {
      title: 'Created Date (Newest)',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Priority (Highest)',
      name: 'priorityAsc',
      by: [{ field: 'priority', direction: 'asc' }],
    },
  ],
});
