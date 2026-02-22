import { definePlugin } from 'sanity';
import { CustomPortableText } from '../components/CustomPortableText';

export const customSchemaPlugin = definePlugin({
  name: 'custom-schema-plugin',
  schema: {
    types: (prev: any[]) => {
      return prev.map((schemaType: any) => {
        // Only modify document types
        if (schemaType.type !== 'document') {
          return schemaType;
        }

        // Clone the schema type to avoid mutating the original
        const newSchemaType = { ...schemaType };

        // If the schema has fields, check for description fields
        if (newSchemaType.fields) {
          newSchemaType.fields = newSchemaType.fields.map((field: any) => {
            // If this is a description field with block type
            if (
              field.name === 'description' &&
              field.type === 'array' &&
              field.of &&
              field.of.some((item: any) => item.type === 'block')
            ) {
              // Return a modified field with our custom component
              return {
                ...field,
                components: {
                  input: CustomPortableText,
                },
              };
            }
            return field;
          });
        }

        return newSchemaType;
      });
    },
  },
});
