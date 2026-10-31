/** @type {import('next').NextConfig} */

// Full-stack Next.js application hosted on Vercel.
// No static export, no basePath — Vercel serves the app at the root domain.
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
};

export default nextConfig;
