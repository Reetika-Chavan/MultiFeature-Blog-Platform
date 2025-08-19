import * as contentstack from 'contentstack'
import ContentstackLivePreview from '@contentstack/live-preview-utils'

// Server-side stack (used in API routes)
export const Stack = contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY!, 
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.CONTENTSTACK_ENVIRONMENT!,
  live_preview: {
    enable: true,
    management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN!,
    host: process.env.CONTENTSTACK_PREVIEW_HOST!,
  },
})

Stack.setHost(process.env.CONTENTSTACK_LIVE_PREVIEW_HOST!)

ContentstackLivePreview.init({
  enable: true,
  stackSdk: Stack,
  ssr: true,
  clientUrlParams: {
    host: process.env.NEXT_PUBLIC_CONTENTSTACK_APP_HOST!,
  },
})
