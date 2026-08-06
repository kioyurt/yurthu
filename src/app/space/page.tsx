// src/app/space/page.tsx
"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import {
  Monitor, Smartphone, Server, Globe,
  Cpu, HardDrive, Wifi, Zap
} from "lucide-react";

const spaces = [
  {
    title: "开发工作站",
    icon: Monitor,
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&h=400&fit=crop",
    description: "MacBook Pro M4 + 4K 显示器 + 机械键盘",
    specs: ["M4 Max", "64GB RAM", "2TB SSD"],
    status: "在线",
  },
  {
    title: "HomeLab 服务器",
    icon: Server,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
    description: "3 节点 K8s 集群，运行 20+ 服务",
    specs: ["K8s", "Proxmox", "10GbE"],
    status: "运行中",
  },
  {
    title: "移动开发",
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
    description: "iPad Pro + Apple Pencil，随时随地编码",
    specs: ["iPad Pro", "Swift Playgrounds"],
    status: "便携",
  },
  {
    title: "IoT 智能家居",
    icon: Wifi,
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=400&fit=crop",
    description: "Home Assistant + ESP32 传感器网络",
    specs: ["Home Assistant", "MQTT", "ESP32"],
    status: "自动化",
  },
];

const timeline = [
  { year: "2020", event: "第一台云服务器" },
  { year: "2021", event: "搭建 HomeLab" },
  { year: "2022", event: "K8s 集群上线" },
  { year: "2023", event: "10GbE 网络升级" },
  { year: "2024", event: "AI 工作站加入" },
  { year: "2025", event: "全自动化运维" },
  { year: "2026", event: "边缘计算节点" },
];

export default function SpacePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle title="数字空间" subtitle="我的设备、服务与数字生活" />

      {/* Space Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {spaces.map((space, i) => (
          <GlassCard key={space.title} delay={i * 0.1} className="overflow-hidden !p-0 group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={space.image}
                alt={space.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white">
                  <space.icon size={20} />
                  <h3 className="font-semibold text-lg">{space.title}</h3>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-full text-xs bg-green-500/90 text-white">
                  ● {space.status}
                </span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {space.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                {space.specs.map((spec) => (
                  <span key={spec} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-mono">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Timeline */}
      <h3 className="text-xl font-bold mb-8 text-center">🚀 进化时间线</h3>
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 -translate-x-1/2" />
        {timeline.map((item, i) => (
          <motion.div
            key={item.year}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center mb-8 ${
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div className={`w-5/12 ${i % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
              <span className="font-mono text-indigo-500 font-bold">{item.year}</span>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.event}</p>
            </div>
            <div className="w-2/12 flex justify-center">
              <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-900 shadow-lg" />
            </div>
            <div className="w-5/12" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}