import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isGitHubPages ? '/kosovalabs' : '',
  assetPrefix: isGitHubPages ? '/kosovalabs/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/kosovalabs' : '',
  },
};

export default nextConfig;
