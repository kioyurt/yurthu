"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight, Download, MapPin, Calendar, ArrowLeft, Layers } from "lucide-react";
import { useT } from "@/hooks/useT";
import type { Photo, Album } from "@/data/photos";
import { getAlbums, getAlbumPhotos } from "@/lib/api";

interface FlatPhoto extends Photo {
  albumTitle: string;
  updatedAt: string;
}

export default function PhotoWallPage() {
  const { tr } = useT();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumCovers, setAlbumCovers] = useState<Record<number, string[]>>({});
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<FlatPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
            {activeAlbum ? activeAlbum.title : tr("照片墙")}
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300 ml-11">
          {activeAlbum ? `${albumPhotos.length} ${tr("张照片")}` : tr("用镜头记录生活的每一个瞬间 📸")}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeAlbumId === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {albums.map((album) => (
            <div key={album.id} onClick={() => openAlbum(album.id)} className="cursor-pointer">
              <div className="text-lg font-semibold">{album.title}</div>
            </div>
          ))}
        </div>
      ) : albumPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Camera className="w-12 h-12 mb-4 opacity-40" />
          <p>{tr("这个相册还没有照片")}</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
          <AnimatePresence>
            {albumPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => openLightbox(i)}
                className="group relative mb-6 break-inside-avoid cursor-pointer"
              >
                <img src={photo.url} alt={photo.caption || photo.albumTitle} className="w-full rounded-lg" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {currentPhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={closeLightbox}
          >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 text-white/80 z-10">
              <span className="text-sm font-mono">{lightboxIndex + 1} / {albumPhotos.length}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            {albumPhotos.length > 1 && (
              <>
                <button
                  className="absolute left-4 md:left-8 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                  onClick={(e) => { e.stopPropagation(); go(-1); }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className="absolute right-4 md:right-8 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                  onClick={(e) => { e.stopPropagation(); go(1); }}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            <motion.div
              key={currentPhoto.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption || "photo"}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
            <div className="absolute bottom-8 left-0 right-0 text-center text-white z-10 pointer-events-none">
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                {currentPhoto.caption || "untitled"}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
