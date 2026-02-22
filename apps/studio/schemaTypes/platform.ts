import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'platform',
  title: 'Platform',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description:
        'Icon name from Lucide icons (e.g., "globe", "monitor", "smartphone")',
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
});
