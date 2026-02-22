import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { customSchemaPlugin } from './plugins/customSchema'
import { projectId, dataset } from '@repo/sanity'

export default defineConfig({
    name: 'default',
    title: 'FMT Software Solutions',

    projectId,
    dataset,

    plugins: [structureTool(), visionTool(), customSchemaPlugin()],

    schema: {
        types: schemaTypes,
    },
})
