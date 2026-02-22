# Netlify Deployment Guide for fmtsoftware.com

This guide explains how to deploy the three frontend applications (Web, Admin, Studio) to Netlify using your domain `fmtsoftware.com`.

## Prerequisites

1.  A Netlify account.
2.  Your GitHub/GitLab/Bitbucket repository connected to Netlify.
3.  Ownership of the domain `fmtsoftware.com`.

## Configuration Files

I have already added `netlify.toml` configuration files to each application directory (`apps/web`, `apps/admin`, `apps/studio`). These files handle:
-   Build commands (`pnpm build`)
-   Publish directories (`dist`)
-   SPA routing rules (redirects for React Router)

## Deployment Steps

You will need to create **three separate sites** in Netlify, one for each application. All three sites will be connected to the **same repository** but will have different **Base directories**.

### 1. Deploy the Web App (fmtsoftware.com)

1.  Go to your Netlify Dashboard and click **"Add new site"** -> **"Import an existing project"**.
2.  Select your Git provider and choose this repository.
3.  Configure the build settings:
    *   **Base directory:** `fmt-ss-frontend/apps/web`
    *   **Build command:** `pnpm build`
    *   **Publish directory:** `dist`
4.  Click **Deploy site**.
5.  Once deployed, go to **Domain management** -> **Domains**.
6.  Click **"Add custom domain"** and enter `fmtsoftware.com`.
7.  Follow Netlify's instructions to configure your DNS records (A record or CNAME).

### 2. Deploy the Admin App (admin.fmtsoftware.com)

1.  Go to your Netlify Dashboard and click **"Add new site"** -> **"Import an existing project"**.
2.  Select the **same repository**.
3.  Configure the build settings:
    *   **Base directory:** `fmt-ss-frontend/apps/admin`
    *   **Build command:** `pnpm build`
    *   **Publish directory:** `dist`
4.  Click **Deploy site**.
5.  Once deployed, go to **Domain management** -> **Domains**.
6.  Click **"Add custom domain"** and enter `admin.fmtsoftware.com`.
7.  Follow Netlify's instructions (usually a CNAME record pointing to the Netlify site URL).

### 3. Deploy the Studio App (studio.fmtsoftware.com)

1.  Go to your Netlify Dashboard and click **"Add new site"** -> **"Import an existing project"**.
2.  Select the **same repository**.
3.  Configure the build settings:
    *   **Base directory:** `fmt-ss-frontend/apps/studio`
    *   **Build command:** `pnpm build`
    *   **Publish directory:** `dist`
4.  Click **Deploy site**.
5.  Once deployed, go to **Domain management** -> **Domains**.
6.  Click **"Add custom domain"** and enter `studio.fmtsoftware.com`.
7.  Follow Netlify's instructions (CNAME record).

## Important: Environment Variables

Since we moved the Sanity configuration to a shared file, you **do not** need to set `VITE_SANITY_PROJECT_ID` or `SANITY_STUDIO_PROJECT_ID` in Netlify for the basic build to work.

However, if your apps use other environment variables (like API URLs, Supabase keys, etc.), you must add them to each site in Netlify under **Site configuration** -> **Environment variables**.

**Required Variables for Web & Admin:**
-   `VITE_API_URL`: Your backend API URL (e.g., `https://api.fmtsoftware.com` or wherever your backend is hosted).
-   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
-   Any other variables from your `.env.local` file.

## CORS Configuration

Ensure your backend (NestJS) allows CORS requests from these three domains:
-   `https://fmtsoftware.com`
-   `https://admin.fmtsoftware.com`
-   `https://studio.fmtsoftware.com`

You may need to update your backend's CORS settings in `main.ts` or `app.module.ts`.
