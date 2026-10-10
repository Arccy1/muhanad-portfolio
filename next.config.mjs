/** @type {import('next').NextConfig} */

// STATIC_EXPORT=1 (set by scripts/build-static.mjs) produces a fully static
// build of the visitor-facing site for GitHub Pages. The normal build stays
// a full-stack server app (admin panel + API + database).
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        // GitHub Pages project sites live under /<repo-name>/
        basePath: "/muhanad-portfolio",
      }
    : {}),
};

export default nextConfig;
