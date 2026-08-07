import type { MediaBase, Orientation } from "./types";

/* ---------- 类型 ---------- */

/** 单张照片 */
export interface Photo extends MediaBase {
  /** 图片地址（原图）。本地文件示例："/media/photos/xxx.jpg" */
  url: string;
  /** 拍立得下方的小字描述 */
  caption?: string;
  /** 横图 / 竖图 */
  orientation: Orientation;
  /** 所属相册 ID */
  albumId: number;
}

/** 相册 */
export interface Album {
  id: number;
  title: string;
  updatedAt: string;
  photoCount: number;
}

/* ---------- 数据 ---------- */

export const albums: Album[] = [
  { id: 1, title: "旅行日记", updatedAt: "2026-07-20T10:30:00", photoCount: 4 },
  { id: 2, title: "城市光影", updatedAt: "2026-06-15T18:20:00", photoCount: 3 },
  { id: 3, title: "美食日常", updatedAt: "2026-05-08T12:00:00", photoCount: 3 },
];

export const photos: Photo[] = [
  // ===== 旅行日记 =====
  { id: "p-101", albumId: 1, title: "山间晨雾", caption: "大理的清晨", orientation: "landscape", date: "2026-07-15", tags: ["风光"],
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200", cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500" },
  { id: "p-102", albumId: 1, title: "京都小巷", caption: "午后的石板路", orientation: "portrait", date: "2026-07-10", tags: ["旅行"],
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200", cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500" },
  { id: "p-103", albumId: 1, title: "湖光山色", caption: "琉森湖畔", orientation: "landscape", date: "2026-07-02", tags: ["风光"],
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200", cover: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500" },
  { id: "p-104", albumId: 1, title: "巴黎铁塔", caption: "黄昏的巴黎", orientation: "portrait", date: "2026-06-28", tags: ["旅行"],
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200", cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500" },

  // ===== 城市光影 =====
  { id: "p-201", albumId: 2, title: "城市几何", orientation: "landscape", date: "2026-06-15", tags: ["建筑"],
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200", cover: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500" },
  { id: "p-202", albumId: 2, title: "东京塔", orientation: "landscape", date: "2026-06-08", tags: ["建筑"],
    url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200", cover: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=500" },
  { id: "p-203", albumId: 2, title: "都市夜景", caption: "加班后的街", orientation: "portrait", date: "2026-06-01", tags: ["夜景"],
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200", cover: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500" },

  // ===== 美食日常 =====
  { id: "p-301", albumId: 3, title: "深夜食堂", caption: "一碗治愈", orientation: "landscape", date: "2026-05-08", tags: ["美食"],
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200", cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500" },
  { id: "p-302", albumId: 3, title: "下午茶", orientation: "landscape", date: "2026-05-03", tags: ["美食"],
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200", cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500" },
  { id: "p-303", albumId: 3, title: "鲜蔬沙拉", orientation: "portrait", date: "2026-04-26", tags: ["美食"],
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200", cover: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500" },
];