import createMDX from '@next/mdx';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repositoryBasePath = isGithubPages ? '/upstack' : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: repositoryBasePath,
  assetPrefix: repositoryBasePath,
  trailingSlash: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Disabled deliberately: StrictMode's dev-only double-mount tears down and
  // re-creates Sandpack's bundler iframe mid-initialization, intermittently
  // leaving the assessment sandbox stuck on its loading cube. Turning it off
  // makes dev behave like production (which never double-mounts) so assessments
  // load reliably while authoring. Revisit if we adopt a mount-safe runtime.
  reactStrictMode: false,
  webpack(config, { isServer, webpack }) {
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test instanceof RegExp && rule.test.test('.svg'),
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: '@svgr/webpack', options: { svgo: true, titleProp: true } }],
    });

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: [require.resolve('buffer/'), 'Buffer'],
          process: require.resolve('process/browser'),
        }),
      );
    }

    return config;
  },
};

export default withMDX(nextConfig);
