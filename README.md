# Multi-Feature Blog Platform with Contentstack Launch

## 🎯 Project Overview

This project showcases the comprehensive capabilities of **Contentstack CMS** and **Contentstack Launch** through a production-grade, AI-focused blog platform. Built with modern web technologies, it demonstrates advanced features including multi-language content delivery, edge computing, intelligent caching strategies, SSO authentication, and geo-location detection. The platform features diverse blog routes such as `/blog/ai`, `/blog/generativeai`, `/blog/gemini`, and `/blog/neuralink`, each implementing different rendering strategies (SSG, ISR, SSR) to highlight Contentstack Launch's flexible deployment configurations and performance optimization capabilities.

![Next.js](https://img.shields.io/badge/Next.js-15.4.7-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Contentstack](https://img.shields.io/badge/Contentstack-CMS-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)

### Key Highlights

- ✅ **Monorepo structure** with Turborepo
- ✅ **Multi-language support** (English, French, Japanese) with automatic geo-detection
- ✅ **Environment-specific domains** with password protection
- ✅ **SSO authentication** via Contentstack OAuth
- ✅ **IP-based access control** for sensitive routes
- ✅ **Edge Functions** for redirects, rewrites, and asset optimization
- ✅ **Intelligent caching** with on-demand revalidation
- ✅ **Cache priming** for new content
- ✅ **CloudWatch integration** for log monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Contentstack Launch                       │
│                  (AWS-AU Region Deployment)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Edge Functions                          │
│  • Geo-location & Locale Detection                          │
│  • Password Protection (preview domain)                      │
│  • IP Whitelisting                                           │
│  • SSO Authentication                                        │
│  • Redirects & Rewrites                                      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Production   │  │   Preview    │  │     Test     │
    │   Domain     │  │   Domain     │  │   Domain     │
    │              │  │  (Password)  │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   Next.js App    │
                    │  (Standalone)    │
                    └──────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Contentstack │  │     CDN      │  │  CloudWatch  │
    │     CMS      │  │   Assets     │  │   Logging    │
    └──────────────┘  └──────────────┘  └──────────────┘
```

---

## ✨ Features Implemented

### 1. Next.js + Monorepo Structure 

- **Monorepo** managed with **Turborepo** for optimized builds
- Project structure:
  - `/apps/blog` - Next.js 15 application with App Router
  - `/functions` - Edge Functions for proxy and CDN assets
  - `/scripts` - Build-time scripts for launch.json generation
- **Rendering strategies:**
  - **SSG (Static)**: `/blog/ai` (50s revalidation)
  - **ISR (Incremental)**: `/blog/generativeai` (1h revalidation), `/blog/latest` (40s revalidation)
  - **SSR (Server-side)**: `/author-tools`

---

### 2. Multi-Language Support with Geo-Location 🌍
**Files:** `apps/blog/src/app/components/LanguageSwitcher.tsx`, `functions/[proxy].edge.js`

- **Supported Languages:**
  - 🇺🇸 English (`en-us`)
  - 🇫🇷 French (`fr-fr`)
  - 🇯🇵 Japanese (`ja-jp`)

- **Automatic Detection:**
  - Uses `visitor-ip-country` header from edge for geo-location
  - Fallback to `accept-language` browser header
  - Automatic redirect based on user location

- **Manual Override:**
  - Language switcher dropdown in UI
  - Query parameter: `?lang=fr-fr`

---

### 3. Environment-Specific Domains 🔐
**File:** `functions/[proxy].edge.js`

**Production Environment:**
- Domain: `blog.devcontentstackapps.com`
- No password protection
- Full production features enabled

**Preview Environment:**
- Domain:  `preview-blog.devcontentstackapps.com`
- **Password Protected** with Basic Auth
- HTTP 401 response if credentials invalid

**Test Environment:**
- Domain: `blog-test.devcontentstackapps.com`
- No password protection
- Used for development testing

---

### 4. Contentstack SSO Authentication 🔑
**Files:** `apps/blog/src/app/login/page.tsx`, `functions/[proxy].edge.js`

- **OAuth 2.0 Flow** with Contentstack SSO
- Protected route: `/author-tools`
- Automatic redirect to login if unauthenticated

**Flow:**
1. User accesses `/author-tools`
2. Edge function checks for JWT in cookies
3. If missing/invalid → redirect to `/login`
4. Login page initiates OAuth flow
5. Callback handler at `/oauth/callback` exchanges code for token
6. JWT stored in secure cookie
7. User redirected to `/author-tools`

---

### 5. IP-Based Access Control 🛡️
**File:** `functions/[proxy].edge.js`

- **Protected Route:** `/author-tools`
- **Allowed IPs:**
  - `27.107.90.206`
  - `27.107.175.218`

- HTTP 403 Forbidden if IP not whitelisted
- IP detection from headers: `CF-Connecting-IP`, `X-Forwarded-For`, `X-Real-IP`

---

### 6. Redirects and Rewrites 🔄
**Files:** `apps/blog/src/app/lib/config.js`, `apps/blog/src/app/lib/redirects.js`, `apps/blog/src/app/lib/rewrites.js`, `functions/[proxy].edge.js`

**Redirects:**
- `/blog/ai` → `/blog/neuralink` (302 temporary redirect)

**Rewrites (Production Only):**
- `/latest` → `/blog/latest` (URL stays as `/latest`)
- `/blog?page=1` → `/blog/latest`

**Environment-Specific:**
- Rewrites only apply on production domain (`blog.devcontentstackapps.com`)
- Preview and test domains excluded via `onlyOnProd` flag

**Files:**
- `apps/blog/src/app/lib/config.js` - Configuration
- `apps/blog/src/app/lib/redirects.js` - Redirect processor
- `apps/blog/src/app/lib/rewrites.js` - Rewrite processor (with environment checks)
- `functions/[proxy].edge.js`  - Edge function integration

---

### 7. Cloud Function for CDN Assets 📦
**File:** `functions/cdn-assets/[asset].js`

- **Custom CDN Path:** `/cdn-assets/*`
- **Image Optimization** using Contentstack Image API
- **Default Optimization:** WebP format, 80% quality

**Features:**
- Proxies assets from Contentstack
- Hides original asset URLs
- Automatic format conversion (WebP)
- Custom query parameters for optimization

---

### 8. Optimal Caching Strategy ⚡
**Files:** `apps/blog/next.config.ts`
**Cache Control Headers:**

| Route | Cache Duration |
|-------|---------------|
| `/blog/gemini` | 50 seconds |

---

### 9. On-Demand Cache Revalidation 🔄
**Files:** `apps/blog/src/app/api/revalidate/route.ts`, `apps/blog/src/app/components/RevalidateButton.tsx`, `apps/blog/src/app/blog/generativeai/page.tsx`

**Feature:** `/blog/generativeai` page includes a **"Revalidate Cache"** button

**Flow:**
1. User clicks "Revalidate Cache" button
2. Calls `/api/revalidate?tag=generative-blog-post&path=/blog/generativeai`
3. Next.js `revalidateTag()` and `revalidatePath()` called
4. Triggers **Contentstack Automate** webhooks for both environments:
5. Cache cleared, page reloaded with fresh content

---

### 10. Cache Priming 🚀
**Files:** `scripts/generateLaunchJson.ts`, `scripts/lib/contentstack-server.ts`

**Automatic Cache**
- Fetches cache priming URLs from Contentstack CMS
- Generates `launch.json` at build time
- Contentstack Launch pre-warms specified routes

**Build Process:**
```bash
npm run prebuild
→ Runs generate:launch script
→ Fetches blog posts with cache priming URLs
→ Generates launch.json
```

**CMS Field Structure:**
```
blogpost (Content Type)
  └── cache (Group)
      └── cachepriming (Group)
          └── urls (Multiple Text)
```

**Files:**
- `scripts/generateLaunchJson.ts` - Main script
- `scripts/lib/contentstack-server.ts` - Contentstack SDK setup
- `package.json`  - `prebuild` script hook

---

### 11. Github & CI/CD 🔧
**Repository:** Hosted on **Bitbucket Cloud**

**CI/CD Setup:**
- Code hosted on Bitbucket
- Automated deployment pipeline configured
- Build triggers on push to main branch
- Deploys to Contentstack Launch

**Build Commands:**
```bash
npm install
npm run build  # Triggers prebuild → generateLaunchJson
```

**Deployment Flow:**
```
Git Push → Bitbucket → CI/CD Pipeline → Build → Deploy to Launch (AWS-AU)
```

---

### 13. CloudWatch Log Targets 📊

**Reference:**
- [Contentstack Log Targets Documentation](https://www.contentstack.com/docs/developers/launch/log-targets)
- [Launch CloudWatch OTEL Collector](https://github.com/contentstack-launch-examples/launch-cloudwatch-otel-collector)


---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Contentstack Account** with API credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MultiFeature-Blog-Platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cd apps/blog
   cp .env.example .env
   # Edit .env with your Contentstack credentials
   ```

4. **Run development server:**
   ```bash
   cd ../..
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

---


### Deploy to Contentstack Launch

1. **Push to Bitbucket:**
   ```bash
   git add .
   git commit -m "Deploy updates"
   git push origin main
   ```

2. **CI/CD automatically triggers:**
   - Runs `npm install`
   - Runs `npm run build`
   - Generates `launch.json`
   - Deploys to selected region

3. **Access deployed application:**
   - Production: `https://blog.devcontentstackapps.com`
   - Preview: `https://preview-blog.devcontentstackapps.com` 
   - Test: `https://blog-test.devcontentstackapps.com`

---

## 📝 Implementation Details

### Multi-Language Blog Post Fetching

```typescript
// apps/blog/src/app/lib/contentstack.ts
export async function getAIBlogPost(locale = "en-us") {
  const Query = Stack.ContentType("blogpost").Query();
  Query.where("url", "/blog/ai").language(locale);
  const response = await Query.toJSON().find();
  return response?.[0]?.[0] || null;
}
```

---

## 🔧 CI/CD Pipeline

### Build Process

```yaml
# Conceptual pipeline (Bitbucket Pipelines)
pipelines:
  default:
    - step:
        name: Build and Deploy
        script:
          - npm install
          - npm run build  # Runs prebuild → generateLaunchJson
          - # Deploy to Contentstack Launch
```

### Build Script Hook

```json
// package.json
{
  "scripts": {
    "prebuild": "npm run generate:launch",
    "generate:launch": "ts-node --project tsconfig.scripts.json scripts/generateLaunchJson.ts",
    "build": "turbo run build"
  }
}
```
---

## 📚 Additional Resources

- **[Contentstack Documentation](https://www.contentstack.com/docs/)**
- **[Contentstack Launch Guide](https://www.contentstack.com/docs/developers/launch/)**
- **[Next.js App Router](https://nextjs.org/docs/app)**
- **[Turborepo Documentation](https://turbo.build/repo/docs)**
- **[CloudWatch OTEL Collector Example](https://github.com/contentstack-launch-examples/launch-cloudwatch-otel-collector)**

---

**Happy Coding! 🚀**
