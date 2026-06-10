/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    // sodium-native is a native Node addon — exclude from client bundle
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      ({ request }, callback) => {
        if (request === "sodium-native" || request === "require-addon") {
          return callback(null, "commonjs " + request);
        }
        callback();
      },
    ];
    return config;
  },
};
module.exports = nextConfig;
