/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

nextConfig.redirects = async () => [
  // the pre-refactor listing route
  { source: '/listings', destination: '/properties', permanent: true },

  // pre-refactor detail URLs: the tier (featured/exclusive) and category (property/plot) used to be
  // part of the path. One URL per listing now: /property/<slug>
  { source: '/property/:tier(featured|exclusive)/:slug', destination: '/property/:slug', permanent: true },
  { source: '/plot/:tier(featured|exclusive)/:slug', destination: '/property/:slug', permanent: true },
  { source: '/plot/:slug', destination: '/property/:slug', permanent: true },
];

module.exports = nextConfig;
