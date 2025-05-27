// Define supported locales
export const locales = ['en', 'sv'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale = 'en';