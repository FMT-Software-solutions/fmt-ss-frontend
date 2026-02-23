import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'freeApp',
  title: 'Free App',
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
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube video URL for the app (optional)',
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
      name: 'requiresAccount',
      title: 'Requires Account',
      type: 'boolean',
      initialValue: false,
      description: 'If enabled, users must create an account/sign in to access the app',
    }),
    defineField({
      name: 'systemRequirements',
      title: 'System Requirements',
      type: 'systemRequirements',
    }),
    defineField({
      name: 'platforms',
      title: 'Available Platforms',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'platform' }] }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'downloadUrl',
      title: 'Download URL',
      type: 'url',
      description: 'URL for downloading the app (if applicable)',
    }),
    defineField({
      name: 'webAppUrl',
      title: 'Web App URL',
      type: 'url',
      description: 'URL for the web version of the app (if applicable)',
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
  ],
  preview: {
    select: {
      title: 'title',
      sector: 'sector.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, sector, media } = selection;
      return {
        title,
        subtitle: sector ? `Sector: ${sector}` : 'Free App',
        media,
      };
    },
  },
});
