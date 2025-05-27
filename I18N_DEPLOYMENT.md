# Internationalization and Vercel Deployment Guide

This document provides information about the internationalization (i18n) setup in this project and how to properly deploy it to Vercel.

## Internationalization Architecture

The project uses Next.js with `next-intl` for internationalization:

1. **Locale Configuration**:
   - Supported locales are defined in `i18n.ts` and imported throughout the app
   - Default locale is set to 'en'
   - All pathnames include the locale prefix (e.g., `/en/math`, `/sv/math`)

2. **Key Files**:
   - `middleware.ts`: Sets up locale detection and routing
   - `i18n.ts` and `i18n/request.ts`: Define supported locales
   - `navigation.ts`: Creates navigation utilities with locale support
   - `app/[locale]/layout.tsx`: Wraps the app with the NextIntlClientProvider
   - `messages/`: Contains translation files (en.json, sv.json)

## Vercel Deployment

When deploying to Vercel, ensure:

1. **Vercel Configuration**:
   - The project includes a `vercel.json` with essential configuration for i18n routing
   - This config ensures proper handling of dynamic routes with locale parameters

2. **Next.js Configuration**:
   - `next.config.mjs` includes the necessary configurations for Vercel compatibility
   - `output: 'standalone'` ensures proper bundling
   - `trailingSlash: false` ensures consistent URL handling

3. **Automated Deployments**:
   - GitHub Actions workflow in `.github/workflows/vercel-deployment.yml` handles automated deployments
   - Pushes to `main` branch trigger production deployments
   - Pull requests trigger preview deployments
   - See `VERCEL_GITHUB_ACTIONS.md` for setup details and troubleshooting

4. **Common Issues**:
   - 404 errors: Usually fixed by proper middleware matcher patterns
   - Locale detection: Ensure browser locale detection is working correctly
   - Routing: Use the `Link` component from `navigation.ts` for all internal links

## Testing a Deployment

To verify a deployment works correctly:

1. Check the root URL redirects to a locale-specific page (e.g., `/` → `/en`)
2. Test direct access to locale-specific routes (e.g., `/en/math`, `/sv/math`)
3. Test language switching functionality
4. Verify that the 404 page works and displays in the correct language

## Adding New Languages

To add a new language:

1. Add the locale code to the `locales` array in `i18n.ts`
2. Create a new translation file in `messages/` (e.g., `de.json`)
3. Restart the development server