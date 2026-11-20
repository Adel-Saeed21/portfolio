import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/**
 * Two modes:
 * - `npm run dev`  → full app: /admin editor, login + save API, language middleware.
 * - `npm run build` → static export to `out/` (for Cloudflare Pages or any static host).
 *
 * Dev-only files use the `.dev.ts` / `.dev.tsx` extension
 * (middleware.dev.ts, app/api/**\/route.dev.ts, app/[lang]/admin/page.dev.tsx),
 * so the static build simply doesn't see them.
 *
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
export default function config(phase) {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    reactStrictMode: true,
    pageExtensions: dev ? ['dev.tsx', 'dev.ts', 'tsx', 'ts'] : ['tsx', 'ts'],
    ...(dev ? {} : { output: 'export', images: { unoptimized: true } }),
  };
}
