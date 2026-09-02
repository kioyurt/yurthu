import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.222.1",        // 局域网 IP
    "yurthu-pc.local",      // 本机主机名（终端输入 hostname 查看）
    "*.ngrok-free.app",     // 如果用内网穿透，通配它的子域名
    "*.cpolar.cn",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
      {
        source: "/media/:path*",
        destination: "http://localhost:8000/media/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
