# GitHub Actions for Vercel Deployment

This document explains how automated deployments to Vercel are set up using GitHub Actions for this project.

## Setup Overview

The repository is configured with GitHub Actions to automatically deploy to Vercel:
- Pushes to the `main` branch trigger production deployments
- Pull requests trigger preview deployments

## Configuration Files

1. **`.github/workflows/vercel-deployment.yml`**: Defines the workflow for automatic deployments
2. **`vercel.json`**: Contains Vercel-specific configuration (routing, headers, etc.)

## Required Secrets

For the workflow to function properly, the following secret must be set in the GitHub repository settings:

- **`VERCEL_TOKEN`**: A Vercel personal access token with deployment permissions

## How to Set Up the Vercel Token

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Go to Settings → Tokens
3. Create a new token with a descriptive name (e.g., "GitHub Actions Deployment")
4. Copy the token value
5. In your GitHub repository, go to Settings → Secrets → Actions
6. Add a new repository secret named `VERCEL_TOKEN` with the token value

## Troubleshooting

If deployments are not working:

1. Check that the `VERCEL_TOKEN` secret is properly set in GitHub repository settings
2. Verify that the Vercel project is correctly linked to the GitHub repository
3. Review GitHub Actions logs for any error messages
4. Ensure the Vercel CLI is correctly installed in the workflow

## Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)