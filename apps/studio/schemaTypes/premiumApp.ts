import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'premiumApp',
  title: 'Premium App',
  type: 'document',
  groups: [
    { name: 'basics', title: 'Basics', default: true },
    { name: 'pricing', title: 'Pricing' },
    { name: 'content', title: 'Content' },
    { name: 'media', title: 'Media' },
    { name: 'downloads', title: 'Downloads & releases' },
    { name: 'selling', title: 'Selling' },
    { name: 'seo', title: 'SEO' },
    { name: 'access', title: 'Access & provisioning' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      group: 'basics',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      group: 'basics',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      group: 'basics',
      type: 'boolean',
      description: 'Show this app on the homepage',
      initialValue: false,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      group: 'basics',
      type: 'boolean',
      description: 'Toggle to publish/unpublish this app',
      initialValue: false,
    }),
    defineField({
      name: 'price',
      title: 'Original Price',
      group: 'pricing',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'requiresAccount',
      title: 'Requires Account',
      group: 'access',
      type: 'boolean',
      initialValue: true,
      description: 'If enabled, users must create an account/sign in to access the app (even if free)',
    }),
    defineField({
      name: 'allowMultipleOrganizationPerUser',
      title: 'Allow Multiple Organizations Per User',
      group: 'access',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, a user can create/own multiple organizations for this app',
      hidden: ({ parent }) => !parent?.requiresAccount,
    }),
    defineField({
      name: 'hasTrialUsage',
      title: 'Has Trial Usage',
      group: 'access',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, users can start a free trial',
      hidden: ({ parent }) => !parent?.requiresAccount,
    }),
    defineField({
      name: 'isFree',
      title: 'Is Free',
      group: 'pricing',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, the app is free to use (price will be ignored)',
    }),
    defineField({
      name: 'promotion',
      title: 'Promotion',
      group: 'pricing',
      type: 'object',
      fields: [
        defineField({
          name: 'hasPromotion',
          title: 'Enable Promotion',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'discountPrice',
          title: 'Promotion Price',
          type: 'number',
          validation: (Rule) => Rule.positive(),
          hidden: ({ parent }) => !parent?.hasPromotion,
        }),
        defineField({
          name: 'startDate',
          title: 'Promotion Start Date',
          type: 'datetime',
          validation: (Rule) => Rule.custom((startDate, context) => {
            const parent = context.parent as any;
            if (!parent?.hasPromotion) return true;
            if (!startDate) return 'Start date is required when promotion is enabled';
            return true;
          }),
          hidden: ({ parent }) => !parent?.hasPromotion,
        }),
        defineField({
          name: 'endDate',
          title: 'Promotion End Date',
          type: 'datetime',
          validation: (Rule) => Rule.custom((endDate, context) => {
            const parent = context.parent as any;
            if (!parent?.hasPromotion) return true;
            if (!endDate) return 'End date is required when promotion is enabled';
            if (parent?.startDate && new Date(endDate) <= new Date(parent.startDate)) {
              return 'End date must be after start date';
            }
            return true;
          }),
          hidden: ({ parent }) => !parent?.hasPromotion,
        }),
        defineField({
          name: 'isActive',
          title: 'Promotion Active',
          type: 'boolean',
          description: 'Manually enable/disable promotion',
          initialValue: true,
          hidden: ({ parent }) => !parent?.hasPromotion,
        }),

      ],
    }),
    defineField({
      name: 'sectors',
      title: 'Sectors',
      group: 'basics',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sector' }] }],
      validation: (Rule) => Rule.required().min(1),
      description: 'Select one or more sectors for this app',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      group: 'media',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      group: 'media',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Video Type',
          type: 'string',
          options: {
            list: [
              { title: 'YouTube Video', value: 'youtube' },
              { title: 'Custom Video URL', value: 'custom' },
            ],
          },
        }),
        defineField({
          name: 'url',
          title: 'Video URL',
          type: 'url',
          description: 'YouTube video URL or custom video URL',
        }),
      ],
    }),
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      group: 'media',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      group: 'content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      group: 'content',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      group: 'content',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'systemRequirements',
      title: 'System Requirements',
      group: 'downloads',
      type: 'systemRequirements',
    }),
    defineField({
      name: 'platforms',
      title: 'Available Platforms',
      group: 'downloads',
      type: 'object',
      fields: [
        defineField({
          name: 'desktop',
          title: 'Desktop Platforms',
          type: 'object',
          fields: [
            defineField({
              name: 'windows',
              title: 'Windows',
              type: 'object',
              fields: [
                defineField({
                  name: 'available',
                  title: 'Available on Windows',
                  type: 'boolean',
                  initialValue: false,
                }),
                defineField({
                  name: 'downloadUrl',
                  title: 'Windows Download URL',
                  type: 'url',
                  hidden: ({ parent }) => !parent?.available,
                }),
              ],
            }),
            defineField({
              name: 'macos',
              title: 'macOS',
              type: 'object',
              fields: [
                defineField({
                  name: 'available',
                  title: 'Available on macOS',
                  type: 'boolean',
                  initialValue: false,
                }),
                defineField({
                  name: 'downloadUrl',
                  title: 'macOS Download URL',
                  type: 'url',
                  hidden: ({ parent }) => !parent?.available,
                }),
              ],
            }),
            defineField({
              name: 'linux',
              title: 'Linux',
              type: 'object',
              fields: [
                defineField({
                  name: 'available',
                  title: 'Available on Linux',
                  type: 'boolean',
                  initialValue: false,
                }),
                defineField({
                  name: 'downloadUrl',
                  title: 'Linux Download URL',
                  type: 'url',
                  hidden: ({ parent }) => !parent?.available,
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'mobile',
          title: 'Mobile Platforms',
          type: 'object',
          fields: [
            defineField({
              name: 'android',
              title: 'Android',
              type: 'object',
              fields: [
                defineField({
                  name: 'available',
                  title: 'Available on Android',
                  type: 'boolean',
                  initialValue: false,
                }),
                defineField({
                  name: 'playStoreUrl',
                  title: 'Google Play Store URL',
                  type: 'url',
                  hidden: ({ parent }) => !parent?.available,
                }),
                defineField({
                  name: 'apkUrl',
                  title: 'Direct APK Download URL',
                  type: 'url',
                  description: 'Optional direct APK download link',
                  hidden: ({ parent }) => !parent?.available,
                }),
              ],
            }),
            defineField({
              name: 'ios',
              title: 'iOS',
              type: 'object',
              fields: [
                defineField({
                  name: 'available',
                  title: 'Available on iOS',
                  type: 'boolean',
                  initialValue: false,
                }),
                defineField({
                  name: 'appStoreUrl',
                  title: 'App Store URL',
                  type: 'url',
                  hidden: ({ parent }) => !parent?.available,
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'web',
          title: 'Web Platform',
          type: 'object',
          fields: [
            defineField({
              name: 'available',
              title: 'Available as Web App',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'webAppUrl',
              title: 'Web App URL',
              type: 'url',
              hidden: ({ parent }) => !parent?.available,
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      group: 'basics',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      group: 'basics',
      type: 'datetime',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      group: 'basics',
      type: 'number',
      description: 'Lower numbers show first in the marketplace',
    }),

    // ---------------------------------------------------------------- releases
    defineField({
      name: 'releases',
      title: 'Releases',
      group: 'downloads',
      type: 'array',
      description: 'Newest first. Filled in by the release script; the first entry is shown as the current version.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'appRelease',
          fields: [
            defineField({
              name: 'version',
              title: 'Version',
              type: 'string',
              validation: (Rule) => Rule.required().regex(/^\d+\.\d+\.\d+$/, { name: 'x.y.z' }),
            }),
            defineField({ name: 'releaseDate', title: 'Release date', type: 'datetime' }),
            defineField({ name: 'notes', title: 'Release notes (Markdown)', type: 'text', rows: 6 }),
            defineField({ name: 'downloadUrl', title: 'Windows download URL', type: 'url' }),
            defineField({ name: 'fileSize', title: 'Installer size (bytes)', type: 'number' }),
          ],
          preview: {
            select: { version: 'version', date: 'releaseDate' },
            prepare: ({ version, date }) => ({
              title: `v${version ?? '?'}`,
              subtitle: date ? new Date(date).toLocaleDateString('en-GB') : undefined,
            }),
          },
        }),
      ],
    }),

    // ---------------------------------------------------------------- content
    defineField({
      name: 'tagline',
      title: 'Tagline',
      group: 'content',
      type: 'string',
      description: 'One line under the app name, e.g. "Know your stock, branch by branch"',
      validation: (Rule) => Rule.max(90),
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      group: 'content',
      type: 'array',
      description: 'The problems it solves, in the customer\'s words (3–6)',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(60) }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2, validation: (Rule) => Rule.max(200) }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'whatsIncluded',
      title: "What's included",
      group: 'content',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Lifetime licence", "Free updates for 12 months", "Onboarding session"',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      group: 'content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),

    // ---------------------------------------------------------------- selling
    defineField({
      name: 'trialDays',
      title: 'Trial length (days)',
      group: 'selling',
      type: 'number',
      initialValue: 30,
      hidden: ({ parent }) => !parent?.hasTrialUsage,
      validation: (Rule) => Rule.integer().min(1).max(365),
    }),
    defineField({
      name: 'paymentPlans',
      title: 'Instalment plans',
      group: 'selling',
      type: 'object',
      description: 'Defaults used when creating a payment plan for this app',
      fields: [
        defineField({ name: 'enabled', title: 'Offer "Pay in instalments"', type: 'boolean', initialValue: true }),
        defineField({
          name: 'minDepositPercent',
          title: 'Deposit (%)',
          type: 'number',
          initialValue: 30,
          validation: (Rule) => Rule.min(1).max(100),
        }),
        defineField({
          name: 'maxInstalments',
          title: 'Instalments after the deposit',
          type: 'number',
          initialValue: 3,
          validation: (Rule) => Rule.integer().min(1).max(36),
        }),
        defineField({
          name: 'surchargePercent',
          title: 'Surcharge (%)',
          type: 'number',
          initialValue: 0,
          validation: (Rule) => Rule.min(0).max(100),
        }),
      ],
    }),
    defineField({
      name: 'addOns',
      title: 'Add-ons',
      group: 'selling',
      type: 'array',
      description: 'Shown on the product page, e.g. SMS credits, onboarding, extra branches',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'string' }),
            defineField({ name: 'price', title: 'Price (GHS)', type: 'number', validation: (Rule) => Rule.min(0) }),
            defineField({ name: 'unit', title: 'Per', type: 'string', description: 'e.g. "one-time", "month", "1,000 SMS"' }),
          ],
          preview: {
            select: { title: 'name', price: 'price', unit: 'unit' },
            prepare: ({ title, price, unit }) => ({
              title,
              subtitle: price != null ? `GHS ${price}${unit ? ` / ${unit}` : ''}` : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Demo & contact',
      group: 'selling',
      type: 'object',
      fields: [
        defineField({
          name: 'whatsappNumber',
          title: 'WhatsApp number',
          type: 'string',
          description: 'International format without +, e.g. 233241234567',
          validation: (Rule) => Rule.regex(/^\d{10,15}$/, { name: 'digits only' }),
        }),
        defineField({ name: 'demoUrl', title: 'Live demo URL', type: 'url' }),
        defineField({ name: 'bookingUrl', title: 'Book a demo URL', type: 'url' }),
      ],
    }),

    // ---------------------------------------------------------------- seo
    defineField({
      name: 'seo',
      title: 'Search & sharing',
      group: 'seo',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Title', type: 'string', validation: (Rule) => Rule.max(60) }),
        defineField({ name: 'metaDescription', title: 'Description', type: 'text', rows: 2, validation: (Rule) => Rule.max(160) }),
        defineField({ name: 'ogImage', title: 'Share image', type: 'image', description: '1200 × 630' }),
      ],
    }),

    defineField({
      name: 'appProvisioning',
      title: 'App Provisioning Configuration',
      group: 'access',
      type: 'object',
      description: 'Configuration for user/organization provisioning after purchase',
      hidden: ({ parent }) => !parent?.requiresAccount,
      fields: [
        defineField({
          name: 'supabaseUrl',
          title: 'Supabase Project URL',
          type: 'url',
          description: 'The Supabase project URL for this app',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'supabaseAnonKey',
          title: 'Supabase Anonymous Key',
          type: 'string',
          description: 'The public anonymous key for this Supabase project',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'edgeFunctionName',
          title: 'Edge Function Name',
          type: 'string',
          description: 'Name of the edge function to call for provisioning (e.g., "create-owner")',
          initialValue: 'create-owner',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, price, media } = selection;
      return {
        title,
        subtitle: `GHS${price}`,
        media,
      };
    },
  },
});
