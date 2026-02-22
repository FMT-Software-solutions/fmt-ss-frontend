import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'training',
  title: 'Training Program',
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
      description: 'Show this training on the homepage',
      initialValue: false,
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
      description: 'YouTube video URL for the training (optional)',
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
      name: 'duration',
      title: 'Duration',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'isFree',
      title: 'Is Free',
      type: 'boolean',
      initialValue: false,
      description: 'Is this a free training program?',
    }),
    defineField({
      name: 'trainingTypes',
      title: 'Training Types',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'trainingType' }],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
      description:
        'Select one or more training types (e.g., Online, In-person)',
    }),
    defineField({
      name: 'registrationLink',
      title: 'Registration Link',
      type: 'object',
      fields: [
        {
          name: 'linkType',
          title: 'Link Type',
          type: 'string',
          options: {
            list: [
              { title: 'Internal (within this platform)', value: 'internal' },
              { title: 'External (outside platform)', value: 'external' },
            ],
            layout: 'radio',
          },
          validation: (Rule) => Rule.required(),
          initialValue: 'internal',
        },
        {
          name: 'internalPath',
          title: 'Internal Path',
          type: 'string',
          description:
            'Route path within this project (e.g., /training/register)',
          hidden: ({ parent }) => parent?.linkType !== 'internal',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { linkType?: string };
              if (parent?.linkType === 'internal' && !value) {
                return 'Internal path is required when link type is internal';
              }
              return true;
            }),
        },
        {
          name: 'externalUrl',
          title: 'External URL',
          type: 'url',
          description: 'Full URL to external registration platform',
          hidden: ({ parent }) => parent?.linkType !== 'external',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { linkType?: string };
              if (parent?.linkType === 'external' && !value) {
                return 'External URL is required when link type is external';
              }
              return true;
            }),
        },
        {
          name: 'linkText',
          title: 'Link Text',
          type: 'string',
          description: 'Text to display on the registration button/link',
          initialValue: 'Register Now',
          validation: (Rule) => Rule.required(),
        },
      ],
      description: 'Custom registration link for this training',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'For in-person trainings, or "Online" for virtual trainings',
    }),
    defineField({
      name: 'eventLinks',
      title: 'Event Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'trainingType',
              title: 'Training Type',
              type: 'reference',
              to: [{ type: 'trainingType' }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'link',
              title: 'Link',
              type: 'url',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'linkText',
              title: 'Link Text',
              type: 'string',
              description:
                'Text to describe the link (e.g., "Join Meeting", "View Location")',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              trainingType: 'trainingType.name',
              linkText: 'linkText',
              link: 'link',
            },
            prepare({ trainingType, linkText, link }) {
              return {
                title: `${trainingType}: ${linkText}`,
                subtitle: link,
              };
            },
          },
        },
      ],
      description:
        'Links for different training types (e.g., online meeting link, in-person location link). These links are only sent via email, not shown on the website.',
    }),
    defineField({
      name: 'instructor',
      title: 'Instructor',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'bio',
          title: 'Bio',
          type: 'text',
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'syllabus',
      title: 'Syllabus',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'maxParticipants',
      title: 'Maximum Participants',
      type: 'number',
      description: 'Maximum number of participants allowed',
    }),
    defineField({
      name: 'registeredParticipants',
      title: 'Registered Participants',
      type: 'number',
      description: 'Current number of registered participants',
      initialValue: 0,
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
      name: 'isPublished',
      title: 'Publish Live',
      type: 'boolean',
      description: 'Enable this to publish the training live and allow registrations. Disable to keep in draft mode.',
      initialValue: false,
    }),
    defineField({
      name: 'registrationEndDate',
      title: 'Registration End Date',
      type: 'datetime',
      description: 'The deadline for registrations. After this date, registrations will be automatically closed.',
      validation: (Rule) => Rule.custom((value, context) => {
        const document = context.document as any;
        if (document?.startDate && value && new Date(value) > new Date(document.startDate)) {
          return 'Registration end date must be before the training start date';
        }
        return true;
      }),
    }),
    defineField({
      name: 'closeRegistration',
      title: 'Close Registration',
      type: 'boolean',
      description: 'Manually disable registrations before the end date (e.g., when spots are full or training is cancelled).',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      types: 'trainingTypes',
      media: 'mainImage',
      price: 'price',
      isFree: 'isFree',
      isPublished: 'isPublished',
      closeRegistration: 'closeRegistration',
    },
    prepare(selection) {
      const { title, types, media, price, isFree, isPublished, closeRegistration } = selection;
      const trainingTypes =
        types?.map((type: any) => type.name).join(', ') || 'Training';
      const status = !isPublished ? '🔒 Draft' : closeRegistration ? '❌ Closed' : '✅ Live';
      return {
        title: `${status} ${title}`,
        subtitle: `${trainingTypes} - ${isFree ? 'Free' : `GHS${price}`}`,
        media,
      };
    },
  },
});
