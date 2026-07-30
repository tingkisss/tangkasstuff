/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@xenova/transformers", "sharp", "onnxruntime-node"]
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  }
};

module.exports = nextConfig;
