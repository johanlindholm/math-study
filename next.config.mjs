import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    appDocumentPreloading: true,
  },
  // Ensure Vercel correctly handles trailing slashes
  trailingSlash: false,
};

export default withNextIntl(nextConfig);