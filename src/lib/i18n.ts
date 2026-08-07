// src/lib/i18n.ts

export type Locale = "zh-CN" | "en" | "ja";

export const localeNames: Record<Locale, string> = {
  "zh-CN": "简体中文",
  en: "English",
  ja: "日本語",
};

/**
 * 翻译字典
 * key = 中文原文（代码里写中文作为 fallback）
 * value = { en: "...", ja: "..." }
 */
const dict: Record<string, Partial<Record<Exclude<Locale, "zh-CN">, string>>> = {
  // ===== 导航 =====
  "首页":     { en: "Home",       ja: "ホーム" },
  "文章":     { en: "Articles",   ja: "記事" },
  "空间":     { en: "Space",      ja: "スペース" },
  "留言":     { en: "Guestbook",  ja: "メッセージ" },
  "AI":       { en: "AI",         ja: "AI" },
  "项目":     { en: "Projects",   ja: "プロジェクト" },
  "友链":     { en: "Friends",    ja: "フレンド" },
  "照片墙":   { en: "Gallery",    ja: "ギャラリー" },
  "归档":     { en: "Archives",   ja: "アーカイブ" },
  "音乐":     { en: "Music",      ja: "音楽" },
  "视频":     { en: "Video",      ja: "動画" },
  "关于":     { en: "About",      ja: "について" },
  "设置":     { en: "Settings",   ja: "設定" },
  "导航":     { en: "Menu",       ja: "ナビ" },

  // ===== 设置页 =====
  "所有修改自动保存，刷新后依然生效": {
    en: "All changes are saved automatically and persist after refresh",
    ja: "すべての変更は自動保存され、リロード後も有効です",
  },
  "主题":     { en: "Theme",      ja: "テーマ" },
  "浅色":     { en: "Light",      ja: "ライト" },
  "深色":     { en: "Dark",       ja: "ダーク" },
  "跟随系统": { en: "System",     ja: "システム" },
  "主题色":   { en: "Accent Color", ja: "アクセントカラー" },
  "偏好设置": { en: "Preferences", ja: "環境設定" },
  "页面动画": { en: "Animations",  ja: "アニメーション" },
  "启用 Framer Motion 过渡效果": {
    en: "Enable Framer Motion transitions",
    ja: "Framer Motion トランジションを有効化",
  },
  "粒子背景": { en: "Particles",   ja: "パーティクル" },
  "首页粒子动画效果": {
    en: "Particle animation on homepage",
    ja: "ホームページのパーティクルアニメーション",
  },
  "音效":     { en: "Sound",      ja: "サウンド" },
  "交互音效反馈": {
    en: "Interaction sound feedback",
    ja: "インタラクションサウンド",
  },
  "通知提醒": { en: "Notifications", ja: "通知" },
  "新文章/评论通知": {
    en: "New article / comment notifications",
    ja: "新着記事・コメント通知",
  },
  "紧凑模式": { en: "Compact Mode", ja: "コンパクトモード" },
  "减小间距，显示更多内容": {
    en: "Reduce spacing, show more content",
    ja: "間隔を縮めて更多内容を表示",
  },
  "阅读时间": { en: "Reading Time", ja: "読了時間" },
  "在文章卡片上显示预计阅读时间": {
    en: "Show estimated reading time on article cards",
    ja: "記事カードに予想読了時間を表示",
  },
  "语言":     { en: "Language",   ja: "言語" },
  "恢复默认设置": {
    en: "Reset to Defaults",
    ja: "デフォルトに戻す",
  },
  "已自动保存": {
    en: "Auto-saved",
    ja: "自動保存済み",
  },

  // ===== 通用 =====
  "纯音乐，请欣赏": {
    en: "Instrumental — enjoy the music",
    ja: "インストゥルメンタル — お楽しみください",
  },
  "记录技术、思考与生活的个人空间": {
    en: "A personal space for tech, thoughts & life",
    ja: "技術・思考・生活を記録する個人スペース",
  },
  // ===== 全站通用 =====
  "阅读全文":   { en: "Read more",    ja: "続きを読む" },
  "阅读更多":   { en: "Read more",    ja: "続きを読む" },
  "查看全部":   { en: "View all",     ja: "すべて見る" },
  "更多":       { en: "More",         ja: "その他" },
  "返回":       { en: "Back",         ja: "戻る" },
  "返回首页":   { en: "Back to Home", ja: "ホームへ戻る" },
  "加载中...":  { en: "Loading...",   ja: "読み込み中..." },
  "加载更多":   { en: "Load more",    ja: "もっと見る" },
  "暂无内容":   { en: "Nothing here yet", ja: "まだコンテンツがありません" },
  "暂无文章":   { en: "No articles yet",  ja: "まだ記事がありません" },
  "搜索":       { en: "Search",       ja: "検索" },
  "搜索文章...": { en: "Search articles...", ja: "記事を検索..." },
  "分类":       { en: "Categories",   ja: "カテゴリ" },
  "标签":       { en: "Tags",         ja: "タグ" },
  "日期":       { en: "Date",         ja: "日付" },
  "共 {count} 篇文章": { en: "{count} articles in total", ja: "全 {count} 記事" },
  "{count} 分钟":      { en: "{count} min", ja: "{count} 分" },
  "上一篇":     { en: "Previous",     ja: "前の記事" },
  "下一篇":     { en: "Next",         ja: "次の記事" },
  "目录":       { en: "Contents",     ja: "目次" },
  "分享":       { en: "Share",        ja: "共有" },
  "复制":       { en: "Copy",         ja: "コピー" },
  "已复制":     { en: "Copied",       ja: "コピーしました" },
  "评论":       { en: "Comments",     ja: "コメント" },
  "发表评论":   { en: "Leave a comment", ja: "コメントする" },
  "昵称":       { en: "Nickname",     ja: "ニックネーム" },
  "邮箱":       { en: "Email",        ja: "メール" },
  "网站":       { en: "Website",      ja: "ウェブサイト" },
  "提交":       { en: "Submit",       ja: "送信" },
  "取消":       { en: "Cancel",       ja: "キャンセル" },
  "回复":       { en: "Reply",        ja: "返信" },
  "播放":       { en: "Play",         ja: "再生" },
  "暂停":       { en: "Pause",        ja: "一時停止" },
  "添加友链":   { en: "Request a link", ja: "リンクを申請" },
  "查看详情":   { en: "View details", ja: "詳細を見る" },
  "页面走丢了": { en: "Page not found", ja: "ページが見つかりません" },
};

/**
 * 翻译函数
 * @param key  中文原文（作为 key 和 zh-CN 的 fallback）
 * @param locale  当前语言
 */
export function t(
  key: string,
  locale: Locale,
  params?: Record<string, string | number>,
): string {
  let str = locale === "zh-CN" ? key : (dict[key]?.[locale] ?? key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str; // 找不到翻译时安全回退为中文
}