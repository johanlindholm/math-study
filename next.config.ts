import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Support for next-intl
  // This adds the internationalization configuration without i18n routing
};

export default withNextIntl(nextConfig);
