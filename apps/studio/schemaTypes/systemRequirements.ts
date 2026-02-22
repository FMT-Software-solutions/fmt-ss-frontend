import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'systemRequirements',
  title: 'System Requirements',
  type: 'object',
  fields: [
    defineField({
      name: 'os',
      title: 'Operating Systems',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Supported operating systems (e.g., "Windows 10+", "macOS 10.15+")',
    }),
    defineField({
      name: 'processor',
      title: 'Processor',
      type: 'string',
      description:
        'Minimum processor requirements (e.g., "1.6 GHz or faster processor")',
    }),
    defineField({
      name: 'memory',
      title: 'Memory',
      type: 'string',
      description: 'Minimum RAM requirements (e.g., "4 GB RAM minimum")',
    }),
    defineField({
      name: 'storage',
      title: 'Storage',
      type: 'string',
      description:
        'Minimum storage requirements (e.g., "1 GB available space")',
    }),
    defineField({
      name: 'additionalRequirements',
      title: 'Additional Requirements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Any additional requirements or dependencies',
    }),
  ],
});
