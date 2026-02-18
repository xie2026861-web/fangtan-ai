/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // 镜像配置
  images: {
    domains: ['localhost', 'api.fangtan.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: '**.qcloudimg.com',
      },
    ],
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_NAME: '房探AI',
  },

  // 重写
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },

  // 压缩
  compress: true,

  // 异步加载
  experimental: {
    optimizePackageImports: ['@ant-design/icons', 'lucide-react'],
  },
};

module.exports = nextConfig;
