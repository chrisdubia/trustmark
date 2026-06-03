const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  // Increase body size limit for the verify endpoint (default is 1MB)
  api: {
    bodyParser: {
      sizeLimit: "52mb",
    },
  },
};

export default nextConfig;
