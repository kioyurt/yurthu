import { albums, photos } from "@/data/photos";
import type { Album, Photo } from "@/data/photos";
import { tracks } from "@/data/music";
import type { Track, LyricLine } from "@/data/music";
import { videos } from "@/data/videos";
import type { Video } from "@/data/videos";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/* ================= 照片 ================= */
export async function getAlbums(): Promise<Album[]> {
  await delay();
  return [...albums].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  await delay();
  return photos.filter((p) => p.albumId === albumId);
}

/* ================= 音乐 ================= */
export async function getTracks(): Promise<Track[]> {
  await delay();
  return tracks;
}

/** 获取某首歌的歌词（没有歌词返回空数组） */
export async function getLyrics(trackId: string): Promise<LyricLine[]> {
  await delay(100);
  const track = tracks.find((t) => t.id === trackId);
  return track?.lyrics ?? [];
}

/* ================= 视频 ================= */
export async function getVideos(): Promise<Video[]> {
  await delay();
  return videos;
}

// 重新导出类型
export type { Track, LyricLine } from "@/data/music";