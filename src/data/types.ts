// src/data/media.ts

// 1. 定义媒体类型枚举
export type MediaType = "image" | "video" | "audio";

// 2. 定义统一的媒体项接口
export interface MediaItem {
  id: string;
  type: MediaType;
  
  // 资源链接
  src: string;          // 主资源 (图片原图 / 视频文件 / 音频文件)
  thumbnail?: string;   // 缩略图 (主要用于视频和音频在列表中的展示，图片可选)
  
  // 元数据
  title: string;
  description?: string;
  category: string;     // 用于筛选，如 "旅行", "音乐", "Vlog"
  date: string;         // ISO 日期字符串
  duration?: string;    // 时长 (仅用于音视频，如 "03:45")
  
  // 样式控制 (可选)
  aspectRatio?: "square" | "portrait" | "landscape" | "wide"; 
}

// 3. 定义分类列表
export const categories = ["全部", "图片", "视频", "音乐", "旅行", "生活"];

// 4. 模拟数据 (Mock Data)
// 注意：这里使用了公开的测试资源链接，确保你能直接看到效果
export const mediaItems: MediaItem[] = [
  // --- 图片 ---
  {
    id: "img-1",
    type: "image",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500",
    title: "山川湖海",
    description: "自由的灵魂在路上",
    category: "旅行",
    date: "2026-08-01",
    aspectRatio: "landscape"
  },
  {
    id: "img-2",
    type: "image",
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500",
    title: "静谧森林",
    description: "呼吸自然的味道",
    category: "旅行",
    date: "2026-07-28",
    aspectRatio: "portrait"
  },
  {
    id: "img-3",
    type: "image",
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
    title: "深夜食堂",
    description: "唯有美食不可辜负",
    category: "生活",
    date: "2026-07-15",
    aspectRatio: "square"
  },

  // --- 视频 ---
  {
    id: "vid-1",
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600", // 电影感封面
    title: "大雄兔片段",
    description: "经典开源动画测试视频",
    category: "视频",
    date: "2026-06-20",
    duration: "09:56",
    aspectRatio: "wide"
  },
  {
    id: "vid-2",
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600",
    title: "大象之梦",
    description: "Blender 基金会作品",
    category: "视频",
    date: "2026-06-10",
    duration: "10:53",
    aspectRatio: "wide"
  },

  // --- 音乐 ---
  {
    id: "aud-1",
    type: "audio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500", // 唱片/波形封面
    title: "Electronic Vibes",
    description: "SoundHelix Demo Track 1",
    category: "音乐",
    date: "2026-05-01",
    duration: "05:47",
    aspectRatio: "square"
  },
  {
    id: "aud-2",
    type: "audio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
    title: "Smooth Jazz",
    description: "午后时光的背景乐