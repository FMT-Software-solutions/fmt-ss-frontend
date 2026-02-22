import { defineCliConfig } from 'sanity/cli'
import { projectId, dataset } from '@repo/sanity'

export default defineCliConfig({
  api: {
    projectId,
    dataset
  }
})
