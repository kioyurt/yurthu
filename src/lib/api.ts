/**
 * 数据访问层
 * - 当前：读取 @/data 静态数据，模拟异步接口
 * - 未来：接入真实后端时，只改这个文件（换成 fetch），页面组件零改动
 */
import { albums, photos } from "@/data/photos";
import type { Album, Photo } from "@/data/photos";
import { tracks } from "@/data/music";
import type { Track } from "@/data/music";
import { videos } from "@/data/videos";
import type { Video } from "@/data/videos";

/** 模拟网络延迟（接真实后端后可删除） */
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/* ================= 照片 ================= */

/** 相册列表（按更新时间倒序） */
export async function getAlbums(): Promise<Album[]> {
  await delay();
  return [...albums].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** 某个相册下的照片 */
export async function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  await delay();
  return photos.filter((p) => p.albumId === albumId);
}

/* ================= 音乐 ================= */

export async function getTracks(): Promise<Track[]> {
  await delay();
  return tracks;
}

/* ================= 视频 ================= */

export async function getVideos(): Promise<Video[]> {
  await delay();
  return videos;
}