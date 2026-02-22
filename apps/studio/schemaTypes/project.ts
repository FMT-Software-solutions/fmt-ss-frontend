import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'project',
    title: 'Project',
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
            description: 'Show this project on the homepage',
            initialValue: false,
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Completed', value: 'completed' },
                    { title: 'Ongoing', value: 'ongoing' },
                    { title: 'Upcoming', value: 'upcoming' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'sectors',
            title: 'Sectors',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'sector' }] }],
            validation: (Rule) => Rule.required().min(1),
            description: 'Select one or more sectors for this project',
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
            description: 'YouTube video URL for the project (optional)',
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
        }),
        defineField({
            name: 'platforms',
            title: 'Available Platforms',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'platform' }] }],
        }),
        defineField({
            name: 'projectUrl',
            title: 'Project URL',
            type: 'url',
            description: 'The URL where the project can be accessed',
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
            status: 'status',
            media: 'mainImage',
        },
        prepare(selection) {
            const { title, status, media } = selection;
            return {
                title,
                subtitle: `Status: ${status}`,
                media,
            };
        },
    },
});
