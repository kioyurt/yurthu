import type { MediaBase } from "./types";

/* ---------- 类型 ---------- */

/** 一行歌词 */
export interface LyricLine {
  /** 时间戳（秒） */
  time: number;
  /** 歌词文本 */
  text: string;
}

/** 一首音乐 */
export interface Track extends MediaBase {
  src: string;
  artist: string;
  duration: number;
  album?: string;
  /** 歌词（可选，没有就不显示 / 显示"纯音乐"） */
  lyrics?: LyricLine[];
}

/* ---------- 数据 ---------- */

export const tracks: Track[] = [
  {
    id: "m-01",
    title: "My Favorite Genre",
    artist: "456456780qwe",
    album: "AI 原创",
    duration: 0, // ← 设为 0，页面会从音频 metadata 自动读取真实时长
    date: "2026-08-07",
    tags: ["AI原创"],
    src: "/music/My Favorite Genre.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    // 暂无歌词 → 显示"纯音乐，请欣赏"
    // 等你听完歌标记好时间轴后，取消下面的注释并填入：
    // lyrics: [
    //   { time: 0,  text: "..." },
    //   { time: 8,  text: "..." },
    // ],
  },
  {
    id: "m-02",
    title: "Rising Through Glass",
    artist: "456456780qwe",
    album: "AI 原创",
    duration: 0,
    date: "2026-08-07",
    tags: ["AI原创"],
    src: "/music/Rising Through Glass.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
  },
  {
    id: "m-03",
    title: "Rising Through Glass 2",
    artist: "456456780qwe",
    album: "AI 原创",
    duration: 0,
    date: "2026-08-07",
    tags: ["AI原创"],
    // ⚠️ 你有两个同名文件，第二个需要重命名！见下方说明
    src: "/music/Rising Through Glass 2.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  },
  {
    id: "m-04",
    title: "永遠に (Toujours)",
    artist: "456456780qwe",
    album: "AI 原创",
    duration: 0,
    date: "2026-08-07",
    tags: ["AI原创"],
    src: "/music/永遠に (Toujours).mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
  },
];