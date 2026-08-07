/**
 * 媒体公共类型定义
 * 图片 / 音乐 / 视频 共用，保证结构统一
 */

/** 图片朝向：决定瀑布流卡片的宽高比 */
export type Orientation = "landscape" | "portrait";

/** 所有媒体共有的基础字段 */
export interface MediaBase {
  /** 唯一 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 封面 / 预览图地址 */
  cover: string;
  /** 日期（ISO 格式） */
  date: string;
  /** 标签，用于筛选 */
  tags?: string[];
}