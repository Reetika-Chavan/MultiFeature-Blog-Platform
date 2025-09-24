import * as contentstack from "contentstack";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import { unstable_cache } from "next/cache";

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

const getCachedAIBlogPost = unstable_cache(
  async (locale: string) => {
    try {
      const Query = Stack.ContentType("blogpost").Query();
      Query.where("url", "/blog/ai").language(locale);
      const response = await Query.toJSON().find();
      return response?.[0]?.[0] || null;
    } catch (error) {
      console.error("Contentstack AI fetch error:", error);
      return null;
    }
  },
  ["ai-blog-post"],
  {
    revalidate: 50,
    tags: ["ai-blog-post"],
  }
);

const getCachedLatestBlogPost = unstable_cache(
  async (locale: string) => {
    try {
      const Query = Stack.ContentType("blogpost").Query();
      Query.where("url", "/blog/latest").language(locale);
      const response = await Query.toJSON().find();
      return response?.[0]?.[0] || null;
    } catch (error) {
      console.error("Contentstack latest blog fetch error:", error);
      return null;
    }
  },
  ["latest-blog-post"],
  {
    revalidate: 40,
    tags: ["latest-blog-post"],
  }
);

export async function getAIBlogPost(locale = "en-us") {
  return getCachedAIBlogPost(locale);
}

export async function getLatestBlogPost(locale = "en-us") {
  return getCachedLatestBlogPost(locale);
}

const getCachedGenerativeBlogPost = unstable_cache(
  async (locale: string) => {
    try {
      const Query = Stack.ContentType("blogpost").Query();
      Query.where("url", "/blog/generativeai").language(locale);
      const response = await Query.toJSON().find();
      return response?.[0]?.[0] || null;
    } catch (error) {
      console.error("Contentstack AI fetch error:", error);
      return null;
    }
  },
  ["generative-blog-post"],
  {
    revalidate: 3600, 
    tags: ["generative-blog-post"],
  }
);

export async function getGenerativeBlogPost(locale = "en-us") {
  return getCachedGenerativeBlogPost(locale);
}

export async function getTestingAIBlogPost(locale = "en-us") {
  try {
    const Query = Stack.ContentType("blogpost").Query();
    Query.where("url", "/blog/testingai").language(locale);
    const response = await Query.toJSON().find();
    return response?.[0]?.[0] || null;
  } catch (error) {
    console.error("Contentstack testing AI fetch error:", error);
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
