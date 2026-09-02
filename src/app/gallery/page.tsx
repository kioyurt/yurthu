// src/app/gallery/page.tsx

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { useT } from "@/hooks/useT";

import type {
  Album,
  Photo,
} from "@/data/photos";

import {
  getAlbumPhotos,
  getAlbums,
} from "@/lib/api";

interface FlatPhoto extends Photo {
  albumTitle: string;
  updatedAt: string;
}

function GalleryLoading() {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
      {Array.from({ length: 12 }).map(
        (_, index) => (
          <div
            key={index}
            className="mb-6 break-inside-avoid rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{
              height: `${180 + (index % 4) * 70}px`,
            }}
          />
        ),
      )}
    </div>
  );
}

export default function PhotoWallPage() {
  const { tr } = useT();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbumId, setActiveAlbumId] =
    useState<number | null>(null);

  const [albumPhotos, setAlbumPhotos] =
    useState<FlatPhoto[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [photosLoading, setPhotosLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [lightboxIndex, setLightboxIndex] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      setLoading(true);
      setError(null);

      try {
        const data = await getAlbums();

        if (!cancelled) {
          setAlbums(data);

          if (data.length > 0) {
            setActiveAlbumId(data[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "相册加载失败",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  const openAlbum = useCallback(
    async (album: Album) => {
      setActiveAlbumId(album.id);
      setPhotosLoading(true);
      setError(null);
      setLightboxIndex(null);

      try {
        const photos = await getAlbumPhotos(
          album.id,
        );

        setAlbumPhotos(
          photos.map((photo) => ({
            ...photo,
            albumTitle: album.title,
            updatedAt: album.updatedAt,
          })),
        );
      } catch (err) {
        setAlbumPhotos([]);

        setError(
          err instanceof Error
            ? err.message
            : "照片加载失败",
        );
      } finally {
        setPhotosLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const activeAlbum = albums.find(
      (album) =>
        album.id === activeAlbumId,
    );

    if (activeAlbum) {
      void openAlbum(activeAlbum);
    }
  }, [
    albums,
    activeAlbumId,
    openAlbum,
  ]);

  const activeAlbum = useMemo(
    () =>
      albums.find(
        (album) =>
          album.id === activeAlbumId,
      ) || null,
    [albums, activeAlbumId],
  );

  const currentPhoto =
    lightboxIndex !== null
      ? albumPhotos[lightboxIndex] || null
      : null;

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const go = (direction: number) => {
    if (
      lightboxIndex === null ||
      albumPhotos.length === 0
    ) {
      return;
    }

    const total = albumPhotos.length;

    setLightboxIndex(
      (lightboxIndex + direction + total) %
        total,
    );
  };

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        go(-1);
      }

      if (event.key === "ArrowRight") {
        go(1);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [lightboxIndex, albumPhotos.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Camera
            size={20}
            className="text-indigo-500"
          />

          <h1 className="text-3xl font-bold">
            {tr("照片")}
          </h1>
        </div>

        <p className="text-gray-500">
          {tr(
            "所有照片都来自服务器媒体库，并按上传月份自动归档。",
          )}
        </p>
      </div>

      {error ? (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <GalleryLoading />
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Camera className="w-12 h-12 mb-4 opacity-40" />
          <p>{tr("媒体库中暂无照片")}</p>
        </div>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
            {albums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() =>
                  void openAlbum(album)
                }
                className={`shrink-0 px-5 py-3 rounded-2xl transition-all ${
                  activeAlbumId === album.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "glass hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                }`}
              >
                <div className="text-sm font-semibold">
                  {tr(album.title)}
                </div>

                <div
                  className={`text-xs mt-1 ${
                    activeAlbumId === album.id
                      ? "text-white/70"
                      : "text-gray-400"
                  }`}
                >
                  {album.photoCount}{" "}
                  {tr("张")}
                </div>
              </button>
            ))}
          </div>

          {photosLoading ? (
            <GalleryLoading />
          ) : albumPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <Camera className="w-12 h-12 mb-4 opacity-40" />
              <p>
                {activeAlbum
                  ? tr("这个相册还没有照片")
                  : tr("请选择相册")}
              </p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
              <AnimatePresence>
                {albumPhotos.map(
                  (photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{
                        opacity: 0,
                        y: 30,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.03,
                          0.2,
                        ),
                      }}
                      onClick={() =>
                        setLightboxIndex(
                          index,
                        )
                      }
                      className="group relative mb-6 break-inside-avoid cursor-pointer"
                    >
                      <img
                        src={photo.url}
                        alt={
                          tr(
                            photo.caption ||
                              photo.title,
                          )
                        }
                        loading="lazy"
                        className="w-full rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                      />

                      <div className="absolute inset-x-0 bottom-0 p-4 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-sm text-white truncate">
                          {tr(
                            photo.caption ||
                              photo.title,
                          )}
                        </p>

                        <p className="text-xs text-white/70 mt-1">
                          {photo.date}
                        </p>
                      </div>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {currentPhoto &&
        lightboxIndex !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={closeLightbox}
          >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 text-white/80 z-10">
              <span className="text-sm font-mono">
                {lightboxIndex + 1} /{" "}
                {albumPhotos.length}
              </span>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeLightbox();
                }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label={tr("关闭")}
              >
                <X size={24} />
              </button>
            </div>

            {albumPhotos.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-4 md:left-8 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                  aria-label={tr("上一张")}
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  type="button"
                  className="absolute right-4 md:right-8 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                  aria-label={tr("下一张")}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            ) : null}

            <motion.div
              key={currentPhoto.id}
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              className="relative max-w-[90vw] max-h-[80vh]"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <img
                src={currentPhoto.url}
                alt={tr(
                  currentPhoto.caption ||
                    currentPhoto.title,
                )}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </motion.div>

            <div className="absolute bottom-8 left-0 right-0 text-center text-white z-10 pointer-events-none px-6">
              <motion.p
                initial={{
                  y: 10,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
              >
                {tr(
                  currentPhoto.caption ||
                    currentPhoto.title,
                )}
              </motion.p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}