import type { MediaBase } from "./types";

/** 一个视频 */
export interface Video extends MediaBase {
  /** 视频文件地址。本地文件示例："/media/videos/xxx.mp4" */
  src: string;
  /** 时长（秒） */
  duration: number;
  /** 分辨率 */
  resolution?: string;
}

export const videos: Video[] = [
  { id: "v-01", title: "Big Buck Bunny", duration: 596, resolution: "1080p", date: "2026-04-02", tags: ["动画"],
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    cover: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg" },
  { id: "v-02", title: "Elephants Dream", duration: 653, resolution: "1080p", date: "2026-03-11", tags: ["动画"],
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    cover: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg" },
  { id: "v-03", title: "For Bigger Blazes", duration: 15, resolution: "720p", date: "2026-02-05", tags: ["短片"],
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    cover: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg" },
  { id: "v-04", title: "Sintel", duration: 888, resolution: "1080p", date: "2026-01-18", tags: ["动画", "短片"],
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    cover: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg" },
];