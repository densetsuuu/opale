import { defineConfig } from '@monocle-app/agent'
import env from '#start/env'

export default defineConfig({
  apiKey: env.get('MONOCLE_API_KEY'),
  endpoint: 'https://stg.ingest.monocle.julr.dev',
  serviceName: env.get('APP_NAME'),
  serviceVersion: env.get('APP_VERSION'),
  environment: env.get('APP_ENV'),
})
