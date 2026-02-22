import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'premiumApp',
  title: 'Premium App',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
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
      type: 'boolean',
      description: 'Show this app on the homepage',
      initialValue: false,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Toggle to publish/unpublish this app',
      initialValue: false,
    }),
    defineField({
      name: 'price',
      title: 'Original Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'allowMultipleOrganizationPerUser',
      title: 'Allow Multiple Organizations Per User',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, a user can create/own multiple organizations for this app',
    }),
    defineField({
      name: 'hasTrialUsage',
      title: 'Has Trial Usage',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, users can start a free trial',
    }),
    defineField({
      name: 'isFree',
      title: 'Is Free',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, the app is free to use (price will be ignored)',
    }),
    defineField({
      name: 'promotion',
      title: 'Promotion',
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
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sector' }] }],
      validation: (Rule) => Rule.required().min(1),
      description: 'Select one or more sectors for this app',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'video',
      title: 'Video',
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
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'description',
      title: 'Description',
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
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'systemRequirements',
      title: 'System Requirements',
      type: 'systemRequirements',
    }),
    defineField({
      name: 'platforms',
      title: 'Available Platforms',
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
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'appProvisioning',
      title: 'App Provisioning Configuration',
      type: 'object',
      description: 'Configuration for user/organization provisioning after purchase',
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
