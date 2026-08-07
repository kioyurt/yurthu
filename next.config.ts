import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.222.1",        // 局域网 IP
    "yurthu-pc.local",      // 本机主机名（终端输入 hostname 查看）
    "*.ngrok-free.app",     // 如果用内网穿透，通配它的子域名
    "*.cpolar.cn",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // 以后加本地/其他图床，在这里继续追加即可
      // { protocol: "https", hostname: "commondatastorage.googleapis.com" }, // 视频封面用
    ],
  },
};

export default nextConfig;
