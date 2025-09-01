import * as contentstack from "contentstack";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

export const Stack = contentstack.Stack({
  api_key: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
  delivery_token: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
  live_preview: {
    enable: true,
    management_token: process.env.NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN!,
    host: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_HOST!,
  },
});

if (process.env.NEXT_PUBLIC_CONTENTSTACK_LIVE_PREVIEW_HOST) {
  Stack.setHost(process.env.NEXT_PUBLIC_CONTENTSTACK_LIVE_PREVIEW_HOST!);
}

ContentstackLivePreview.init({
  enable: true,
  stackSdk: Stack,
  ssr: true,
  clientUrlParams: {
    host: process.env.NEXT_PUBLIC_CONTENTSTACK_APP_HOST!,
  },
});

export async function getAIBlogPost(locale = "en-us") {
  try {
    const Query = Stack.ContentType("blogpost").Query();
    Query.where("url", "/blog/ai").language(locale); 
    const response = await Query.toJSON().find();
    return response?.[0]?.[0] || null;
  } catch (error) {
    console.error("Contentstack AI fetch error:", error);
    return null;
  }
}

export async function getLatestBlogPost(locale = "en-us") {
  try {
    const Query = Stack.ContentType("blogpost").Query();
    Query.where("url", "/blog/latest").language(locale); 
    const response = await Query.toJSON().find();
    return response?.[0]?.[0] || null;
  } catch (error) {
    console.error("Contentstack latest blog fetch error:", error);
    return null;
  }
}

export async function getAllBlogPosts(locale = "en-us") {
  try {
    const Query = Stack.ContentType("blogpost").Query();
    Query.language(locale); 
    const response = await Query.toJSON().find();
    return response?.[0] || [];
  } catch (error) {
    console.error("Contentstack fetch all posts error:", error);
    return [];
  }
}
