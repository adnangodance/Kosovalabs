import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isGitHubPages ? '/Kosovalabs' : '',
  assetPrefix: isGitHubPages ? '/Kosovalabs/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/Kosovalabs' : '',
  },
};

export default nextConfig;
