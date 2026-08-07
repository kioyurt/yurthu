"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight, Download, MapPin, Calendar, ArrowLeft, Layers } from "lucide-react";
import type { Photo, Album } from "@/data/photos";
import { getAlbums, getAlbumPhotos } from "@/lib/api";

interface FlatPhoto extends Photo {
  albumTitle: string;
  updatedAt: string;
}

export default function PhotoWallPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumCovers, setAlbumCovers] = useState<Record<number, string[]>>({}); // 每个相册的前几张封面
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<FlatPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 1. 拉取相册 + 预加载每个相册的前 3 张封面
  useEffect(() => {
    (async () => {
      try {
        const list = await getAlbums();
        setAlbums(list);

        const covers: Record<number, string[]> = {};
        await Promise.all(
          list.map(async (album) => {
            const photos = await getAlbumPhotos(album.id);
            covers[album.id] = photos.slice(0, 3).map((p) => p.cover || p.url);
          })
        );
        setAlbumCovers(covers);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. 点击相册 → 进入照片瀑布流
  const openAlbum = useCallback(async (id: number) => {
    setLoading(true);
    setActiveAlbumId(id);
    const list = await getAlbumPhotos(id);
    const album = albums.find((a) => a.id === id);
    setAlbumPhotos(
      list.map((p) => ({ ...p, albumTitle: album?.title ?? "", updatedAt: album?.updatedAt ?? "" }))
    );
    setLoading(false);
  }, [albums]);

  const backToList = () => {
    setActiveAlbumId(null);
    setAlbumPhotos([]);
  };

  // 3. 灯箱
  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const go = useCallback(
    (dir: number) =>
      setLightboxIndex((prev) =>
        prev === null ? prev : (prev + dir + albumPhotos.length) % albumPhotos.length
      ),
    [albumPhotos.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, go]);

  const currentPhoto = lightboxIndex !== null ? albumPhotos[lightboxIndex] : null;
  const activeAlbum = albums.find((a) => a.id === activeAlbumId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      {/* 页头 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          {activeAlbumId !== null && (
            <button onClick={backToList} className="p-1.5 rounded-full hover:bg-white/10 text-sky-500 transition-colors">
              <ArrowLeft size={22} />
            </button>
          )}
          <Camera className="w-7 h-7 text-sky-500" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {activeAlbum ? activeAlbum.title : "照片墙"}
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300 ml-11">
          {activeAlbum ? `${albumPhotos.length} 张照片` : "用镜头记录生活的每一个瞬间 📸"}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeAlbumId === null ? (
        /* ========== 视图 A：堆叠封面网格 ========== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {albums.map((album, i) => (
            <StackedAlbumCover
              key={album.id}
              album={album}
              covers={albumCovers[album.id] || []}
              index={i}
              onOpen={() => openAlbum(album.id)}
            />
          ))}
        </div>
      ) : albumPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Camera className="w-12 h-12 mb-4 opacity-40" />
          <p>这个相册还没有照片</p>
        </div>
      ) : (
        /* ========== 视图 B：相册内照片瀑布流 ========== */
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
          <AnimatePresence>
            {albumPhotos.map((photo, i) => {
              const seed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1);
              const rotation = ((seed % 7) - 3) * 0.6;
              const isLandscape = photo.orientation === "landscape";
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
                  animate={{ opacity: 1, y: 0, rotate: rotation }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
                  whileHover={{ rotate: 0, scale: 1.02, zIndex: 10 }}
                  onClick={() => openLightbox(i)}
                  className="group relative mb-6 break-inside-avoid cursor-pointer"
                  style={{ transformOrigin: "center center" }}
                >
                  <div className="relative bg-white dark:bg-slate-800 p-2 pb-7 rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-300 ring-1 ring-black/5 dark:ring-white/10">
                    <div className={`relative overflow-hidden rounded-[1px] ${isLandscape ? "aspect-[4/3]" : "aspect-[3/4]"}`}>
                      <Image src={photo.url} alt={photo.caption || photo.albumTitle} fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    {(photo.caption || photo.albumTitle) && (
                      <div className="absolute bottom-2 left-0 right-0 text-center px-2 truncate">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-serif italic tracking-wide">
                          {photo.caption || photo.albumTitle}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 left-3 w-10 h-4 bg-amber-200/60 dark:bg-amber-300/30 rounded-sm rotate-[-6deg] pointer-events-none backdrop-blur-[1px]" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ===== 灯箱 ===== */}
      <AnimatePresence>
        {currentPhoto && lightboxIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={closeLightbox}>
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 text-white/80 z-10">
              <span className="text-sm font-mono">{lightboxIndex + 1} / {albumPhotos.length}</span>
              <div className="flex items-center gap-4">
                <a href={currentPhoto.url.split("?")[0]} target="_blank" rel="noreferrer" download
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-sm hover:text-white transition-colors">
                  <Download size={16} /> 原图
                </a>
                <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
              </div>
            </div>
            {albumPhotos.length > 1 && (
              <>
                <button className="absolute left-4 md:left-8 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                  onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft size={32} /></button>
                <button className="absolute right-4 md:right-8 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                  onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight size={32} /></button>
              </>
            )}
            <motion.div key={currentPhoto.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-[90vw] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <Image src={currentPhoto.url} alt={currentPhoto.caption || "照片"} width={1600} height={1200}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl" priority />
            </motion.div>
            <div className="absolute bottom-8 left-0 right-0 text-center text-white z-10 pointer-events-none">
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="font-medium text-lg drop-shadow-md">{currentPhoto.caption || "无题"}</motion.p>
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 mt-2 text-sm text-white/60">
                <span className="flex items-center gap-1"><MapPin size={12} /> {currentPhoto.albumTitle}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {currentPhoto.updatedAt.slice(0, 10)}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   🔥 堆叠式相册封面 —— 真实照片层层叠放 + hover 扇形展开
   ============================================================ */

// 每一层的静态姿态（折叠状态）：旋转 + 位移 + 缩放
// 索引 0 = 最顶层（封面），越往后越靠底
const STACK_LAYERS = [
  { rotate: -2, x: 0,   y: 0,  scale: 1,    z: 30 }, // 顶层
  { rotate: 4,  x: 14,  y: 10, scale: 0.96, z: 20 }, // 中层
  { rotate: -6, x: -12, y: 18, scale: 0.92, z: 10 }, // 底层
];

// hover 时扇形展开的姿态
const FAN_LAYERS = [
  { rotate: -10, x: -60, y: 0,  scale: 1,    z: 30 },
  { rotate: 0,   x: 0,   y: -10, scale: 1,   z: 20 },
  { rotate: 10,  x: 60,  y: 0,  scale: 1,    z: 10 },
];

function StackedAlbumCover({
  album, covers, index, onOpen,
}: {
  album: Album;
  covers: string[];
  index: number;
  onOpen: () => void;
}) {
  // 至少保证有内容可渲染（不足 3 张时复用已有图）
  const layers = Array.from({ length: 3 }, (_, i) => covers[i % Math.max(covers.length, 1)] || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={onOpen}
      className="group cursor-pointer flex flex-col items-center"
    >
      {/* 堆叠容器 —— 固定宽高比，内部绝对定位各层 */}
      <div className="relative w-full aspect-[4/3] mb-5 [perspective:1000px]">
        {layers.map((src, i) => {
          const stack = STACK_LAYERS[i];
          const fan = FAN_LAYERS[i];
          return (
            <motion.div
              key={i}
              // 默认折叠姿态
              initial={false}
              animate={{
                rotate: stack.rotate,
                x: stack.x,
                y: stack.y,
                scale: stack.scale,
              }}
              // hover 时扇形展开
              whileHover={{
                rotate: fan.rotate,
                x: fan.x,
                y: fan.y,
                scale: fan.scale,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{ zIndex: stack.z }}
              className="absolute inset-0 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10 dark:ring-white/10 bg-slate-200 dark:bg-slate-700"
            >
              {src ? (
                <Image
                  src={src}
                  alt={`${album.title} - ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-200 to-indigo-300 dark:from-slate-600 dark:to-slate-800" />
              )}
              {/* 每层轻微暗角，增强层次 */}
              {i > 0 && <div className="absolute inset-0 bg-black/15" />}
            </motion.div>
          );
        })}

        {/* 张数角标（始终在最上层） */}
        <div className="absolute bottom-3 right-3 z-40 px-2.5 py-1 rounded-full bg-sky-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1 pointer-events-none">
          <Layers size={12} /> {album.photoCount} 张
        </div>
      </div>

      {/* 标题 + 日期 */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 transition-colors text-center">
        {album.title}
      </h3>
      <p className="text-sm text-slate-400 mt-1">{album.updatedAt.replace("T", " ").slice(0, 19)}</p>
    </motion.div>
  );
}