// src/app/gallery/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { X, Camera, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const categories = ["全部", "风光", "人文", "美食", "建筑", "旅行"];

const photos = [
  { id: 1, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=800&fit=crop", title: "山间晨雾", category: "风光", location: "云南·大理", date: "2026-07-15", height: "h-80" },
  { id: 2, src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop", title: "京都小巷", category: "旅行", location: "日本·京都", date: "2026-06-20", height: "h-52" },
  { id: 3, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop", title: "深夜食堂", category: "美食", location: "上海·静安", date: "2026-06-10", height: "h-64" },
  { id: 4, src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=800&fit=crop", title: "城市几何", category: "建筑", location: "深圳·南山", date: "2026-05-28", height: "h-80" },
  { id: 5, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop", title: "下午茶", category: "美食", location: "杭州·西湖", date: "2026-05-15", height: "h-52" },
  { id: 6, src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop", title: "云海日出", category: "风光", location: "安徽·黄山", date: "2026-04-20", height: "h-64" },
  { id: 7, src: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&h=400&fit=crop", title: "东京塔", category: "建筑", location: "日本·东京", date: "2026-04-01", height: "h-52" },
  { id: 8, src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=800&fit=crop", title: "街头人像", category: "人文", location: "北京·胡同", date: "2026-03-18", height: "h-80" },
  { id: 9, src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop", title: "湖光山色", category: "风光", location: "瑞士·琉森", date: "2026-02-14", height: "h-52" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered = activeCategory === "全部"
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <SectionTitle title="照片墙" subtitle="用镜头记录世界的美好 📸" />

      {/* Category Filter */}
      <div className="flex gap-2 justify-center flex-wrap mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                : "glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="masonry">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.05 }}
              className="masonry-item group cursor-pointer"
              onClick={() => { setSelectedPhoto(photo); setLightboxIndex(i); }}
            >
              <div className={`relative rounded-2xl overflow-hidden ${photo.height}`}>
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h4 className="text-white font-medium">{photo.title}</h4>
                  <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {photo.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setSelectedPhoto(null)}>
              <X size={28} />
            </button>
            <button
              className="absolute left-6 text-white/70 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + filtered.length) % filtered.length); setSelectedPhoto(filtered[(lightboxIndex - 1 + filtered.length) % filtered.length]); }}
            >
              <ChevronLeft size={36} />
            </button>
            <motion.img
              key={selectedPhoto.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-6 text-white/70 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % filtered.length); setSelectedPhoto(filtered[(lightboxIndex + 1) % filtered.length]); }}
            >
              <ChevronRight size={36} />
            </button>
            <div className="absolute bottom-8 text-center text-white">
              <p className="font-medium">{selectedPhoto.title}</p>
              <p className="text-sm text-white/60 flex items-center justify-center gap-2 mt-1">
                <MapPin size={12} /> {selectedPhoto.location}
                <Calendar size={12} /> {selectedPhoto.date}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}