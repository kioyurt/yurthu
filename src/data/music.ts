import type { MediaBase } from "./types";

/** 一首音乐 */
export interface Track extends MediaBase {
  /** 音频文件地址。本地文件示例："/media/music/xxx.mp3" */
  src: string;
  /** 艺术家 */
  artist: string;
  /** 时长（秒），请按实际文件修改 */
  duration: number;
  /** 专辑名 */
  album?: string;
}

export const tracks: Track[] = [
  { id: "m-01", title: "Sunrise Drive", artist: "SoundHelix", album: "Demo Vol.1", duration: 372, date: "2026-03-10", tags: ["电子"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500" },
  { id: "m-02", title: "Midnight City", artist: "SoundHelix", album: "Demo Vol.1", duration: 425, date: "2026-02-20", tags: ["纯音乐"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" },
  { id: "m-03", title: "Ocean Breath", artist: "SoundHelix", duration: 358, date: "2026-01-15", tags: ["轻音乐"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500" },
  { id: "m-04", title: "Live Session", artist: "SoundHelix", duration: 301, date: "2025-12-24", tags: ["现场"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500" },
];