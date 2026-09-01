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
  "当前：": { en: "Current: ", ja: "現在：" },
  "全站主题色已同步更新": {
    en: "The global accent color has been synced",
    ja: "サイト全体のテーマカラーが同期されました",
  },
  "关于我": { en: "About Me", ja: "私について" },
  "一个热爱创造的开发者": { en: "A developer who loves creating", ja: "創作が大好きな開発者" },
  "热爱技术，喜欢用代码创造美好的事物。相信开源的力量，享受学习和分享的过程。白天写代码，晚上看星星。✨": {
    en: "I love technology and enjoy creating beautiful things with code. I believe in the power of open source and enjoy learning and sharing. I write code by day and watch the stars by night. ✨",
    ja: "技術が大好きで、コードで素敵なものを作るのが好きです。オープンソースの力を信じ、学びと共有を楽しんでいます。昼はコードを書き、夜は星を眺めます。✨",
  },
  "中国 · 陕西": { en: "Shaanxi, China", ja: "中国・陝西" },
  "技能": { en: "Skills", ja: "スキル" },
  "兴趣爱好": { en: "Interests", ja: "趣味" },
  "经历": { en: "Experience", ja: "経歴" },
  "留言板": { en: "Guestbook", ja: "メッセージボード" },
  "在这里留下你的足迹 💫": { en: "Leave your footprint here 💫", ja: "ここに足跡を残してください 💫" },
  "友善交流，互相尊重": { en: "Friendly exchange, mutual respect", ja: "フレンドリーに交流し、お互いを尊重しましょう" },
  "发布": { en: "Publish", ja: "投稿" },
  "你的昵称": { en: "Your nickname", ja: "ニックネーム" },
  "写点什么吧...": { en: "Write something...", ja: "何か書いてみてください..." },
  "友情链接": { en: "Friends", ja: "友達リンク" },
  "互联网上的好朋友们 🤝": { en: "Good friends on the internet 🤝", ja: "インターネット上の仲間たち 🤝" },
  "申请友链": { en: "Apply for link exchange", ja: "友達リンクを申請" },
  "如果你也有一个有趣的博客，欢迎交换友链！": {
    en: "If you have an interesting blog, feel free to exchange links!",
    ja: "面白いブログがあれば、友達リンク交換も歓迎です！",
  },
  "申请添加": { en: "Apply to add", ja: "追加を申請" },
  "博客地址": { en: "Blog URL", ja: "ブログURL" },
  "一句话介绍": { en: "One-line intro", ja: "一言紹介" },
  "提交申请": { en: "Submit application", ja: "申請を送信" },
  "智能对话 · 语义搜索 · 知识问答": { en: "Smart chat · semantic search · knowledge QA", ja: "スマート対話・意味検索・知識問答" },
  "搜索文章": { en: "Search articles", ja: "記事を検索" },
  "生成摘要": { en: "Generate summary", ja: "要約を生成" },
  "技术问答": { en: "Technical Q&A", ja: "技術Q&A" },
  "代码助手": { en: "Code assistant", ja: "コードアシスタント" },
  "你好！我是博客 AI 助手 ✨ 可以帮你搜索文章、回答问题、生成摘要。试试下面的快捷操作，或直接输入你的问题吧！": {
    en: "Hello! I am the blog AI assistant ✨ I can help you search articles, answer questions, and generate summaries. Try one of the quick actions below or ask your question directly!",
    ja: "こんにちは！私はブログAIアシスタントです ✨ 記事検索、質問回答、要約生成をお手伝いできます。下のクイック操作を試すか、直接質問してください！",
  },
  "输入你的问题...": { en: "Type your question...", ja: "質問を入力してください..." },
  "收到你的问题：\"{msg}\"\n\n这是一个模拟响应。实际部署时，这里会调用你的后端 AI API（如 OpenAI / 本地 LLM）来生成回答。\n\n💡 可以接入：\n• 语义搜索（pgvector）\n• 文章摘要生成\n• 代码解释\n• 智能推荐": {
    en: "Received your question: \"{msg}\"\n\nThis is a simulated response. In production, this area will call your backend AI API (such as OpenAI / local LLM) to generate the answer.\n\n💡 Integrations include:\n• semantic search (pgvector)\n• article summary generation\n• code explanation\n• intelligent recommendations",
    ja: "質問を受け取りました: \"{msg}\"\n\nこれはモック応答です。実運用では、バックエンドAI API（OpenAI / ローカルLLM等）を呼び出して回答を生成します。\n\n💡 連携可能な機能:\n• 意味検索（pgvector）\n• 記事要約生成\n• コード説明\n• インテリジェント推薦",
  },
  "开始阅读": { en: "Start reading", ja: "読む" },
  "照片": { en: "Photos", ja: "写真" },
  "开源项目": { en: "Open source projects", ja: "オープンソースプロジェクト" },
  "空间展示": { en: "Space showcase", ja: "スペース展示" },
  "3D 可视化个人数字空间": { en: "3D visualized personal digital space", ja: "3Dで可視化した個人デジタルスペース" },
  "技术文章": { en: "Tech articles", ja: "技術記事" },
  "深度技术分享与实践记录": { en: "In-depth technical sharing and practical notes", ja: "技術の深掘りと実践記録" },
  "GitHub 上的开源贡献": { en: "Open source contributions on GitHub", ja: "GitHubでのオープンソース貢献" },
  "智能对话与知识检索": { en: "Smart conversation and knowledge retrieval", ja: "スマート対話と知識検索" },
  "你好，我是 kioyurt 👋": { en: "Hello, I'm kioyurt 👋", ja: "こんにちは、kioyurtです 👋" },
  "热爱代码与设计 ✨": { en: "Loving code and design ✨", ja: "コードとデザインが大好き ✨" },
  "记录生活的每一刻 📸": { en: "Capturing every moment of life 📸", ja: "生活のひとつひとつを記録 📸" },
  "探索 AI 的边界 🤖": { en: "Exploring the edge of AI 🤖", ja: "AIの可能性を探求 🤖" },
  "全栈开发者 / 开源爱好者 / AI研究生": { en: "Full-stack developer / open source enthusiast / AI graduate student", ja: "フルスタック開発者 / オープンソース愛好家 / AI研究生" },
  "在这里分享技术、思考与生活": { en: "Sharing technology, thoughts, and life here", ja: "ここで技術・思考・生活を共有します" },
  "最新文章": { en: "Latest articles", ja: "最新記事" },
  "2026年前端趋势：AI驱动开发": { en: "2026 Frontend trends: AI-driven development", ja: "2026年のフロントエンド動向：AI駆動開発" },
  "用 Rust 重写我的博客引擎": { en: "Rewriting my blog engine in Rust", ja: "Rustでブログエンジンを再構築" },
  "我的 HomeLab 搭建全记录": { en: "My HomeLab setup journey", ja: "HomeLab構築の全記録" },
  "前端": { en: "Frontend", ja: "フロントエンド" },
  "性能": { en: "Performance", ja: "パフォーマンス" },
  "HomeLab": { en: "HomeLab", ja: "HomeLab" },
  "运维": { en: "Operations", ja: "運用" },
  "Rust": { en: "Rust", ja: "Rust" },
  "© 2026 KIOYURT": { en: "© 2026 KIOYURT", ja: "© 2026 KIOYURT" },

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
  
  // ===== 兴趣爱好 =====
  "编程": { en: "Programming", ja: "プログラミング" },
  "咖啡": { en: "Coffee", ja: "コーヒー" },
  "阅读": { en: "Reading", ja: "読書" },
  "设计": { en: "Design", ja: "デザイン" },
  
  // ===== 项目页 =====
  "仓库": { en: "Repos", ja: "リポジトリ" },
  "关注者": { en: "Followers", ja: "フォロワー" },
  
  // ===== 文章页 =====
  "记录技术探索与生活感悟": { en: "Sharing tech exploration and life insights", ja: "技術探求と生活洞察を共有" },
  
  // ===== 项目页 =====
  "GitHub 数据暂时无法加载（网络或 API 限流），请稍后刷新。": {
    en: "Failed to load GitHub data (network or API rate limit). Please refresh later.",
    ja: "GitHub データ読み込み失敗（ネットワークまたは API レート制限）。後で再度読み込んでください。"
  },
  "直接访问 GitHub": { en: "Visit GitHub directly", ja: "GitHub にアクセス" },
  "还没有公开仓库，去 GitHub 写第一个项目吧 →": {
    en: "No public repositories yet. Go write your first project on GitHub →",
    ja: "公開リポジトリがまだありません。GitHub で最初のプロジェクトを書きましょう →"
  },
  "在 GitHub 上的代码与贡献": { en: "Code and contributions on GitHub", ja: "GitHub でのコードと貢献" },
  "这个人很懒，什么都没写": { en: "This person is very lazy and hasn't written anything", ja: "この人はとても怠け者で、何も書いていません" },
  "暂无描述": { en: "No description yet", ja: "説明がまだありません" },
  "📌 Pinned": { en: "📌 Pinned", ja: "📌 Pinned" },
  "📊 年度贡献热力图": { en: "📊 Annual contribution heatmap", ja: "📊 年度貢献ヒートマップ" },
  "热力图加载失败，去 GitHub 查看 →": { en: "Heatmap failed to load, go check on GitHub →", ja: "ヒートマップの読み込みに失敗しました。GitHub で確認してください →" },
  "数据来自 GitHub，每小时自动更新": { en: "Data from GitHub, auto-updated every hour", ja: "GitHub のデータ、1時間ごとに自動更新" },
  "探索": { en: "Explore", ja: "探索" },
  "AI 助手": { en: "AI Assistant", ja: "AI アシスタント" },
  
  // ===== 空间页 =====
  "数字空间": { en: "Digital Space", ja: "デジタルスペース" },
  "我的设备、服务与数字生活": { en: "My devices, services & digital life", ja: "私のデバイス、サービス、デジタル生活" },
  "开发工作站": { en: "Dev Workstation", ja: "開発ワークステーション" },
  "MacBook Pro M4 + 4K 显示器 + 机械键盘": { en: "MacBook Pro M4 + 4K Monitor + Mechanical Keyboard", ja: "MacBook Pro M4 + 4K モニター + メカニカルキーボード" },
  "在线": { en: "Online", ja: "オンライン" },
  "HomeLab 服务器": { en: "HomeLab Server", ja: "HomeLab サーバー" },
  "3 节点 K8s 集群，运行 20+ 服务": { en: "3-node K8s cluster, running 20+ services", ja: "3ノード K8s クラスタ、20+ サービス実行中" },
  "运行中": { en: "Running", ja: "実行中" },
  "移动开发": { en: "Mobile Dev", ja: "モバイル開発" },
  "iPad Pro + Apple Pencil，随时随地编码": { en: "iPad Pro + Apple Pencil, code anywhere", ja: "iPad Pro + Apple Pencil、どこでもコーディング" },
  "便携": { en: "Portable", ja: "ポータブル" },
  "IoT 智能家居": { en: "IoT Smart Home", ja: "IoT スマートホーム" },
  "Home Assistant + ESP32 传感器网络": { en: "Home Assistant + ESP32 sensor network", ja: "Home Assistant + ESP32 センサーネットワーク" },
  "自动化": { en: "Automated", ja: "自動化" },
  "🚀 进化时间线": { en: "🚀 Evolution Timeline", ja: "🚀 進化タイムライン" },
  "第一台云服务器": { en: "First cloud server", ja: "最初のクラウドサーバー" },
  "搭建 HomeLab": { en: "Built HomeLab", ja: "HomeLab構築" },
  "K8s 集群上线": { en: "K8s cluster online", ja: "K8s クラスタオンライン" },
  "10GbE 网络升级": { en: "10GbE network upgrade", ja: "10GbE ネットワークアップグレード" },
  "AI 工作站加入": { en: "AI workstation added", ja: "AI ワークステーション追加" },
  "全自动化运维": { en: "Full automation ops", ja: "完全自動化運用" },
  "边缘计算节点": { en: "Edge computing nodes", ja: "エッジコンピューティングノード" },
  
  // ===== 文章页 =====
  "全部": { en: "All", ja: "すべて" },
  "后端": { en: "Backend", ja: "バックエンド" },
  "AI": { en: "AI", ja: "AI" },
  "生活": { en: "Life", ja: "ライフ" },
  "摄影": { en: "Photography", ja: "写真" },
  "开源": { en: "Open source", ja: "オープンソース" },
  "2026年前端开发趋势：AI 驱动的新范式": { en: "2026 Frontend Trends: AI-Driven New Paradigm", ja: "2026年フロントエンド開発トレンド：AI駆動の新パラダイム" },
  "探索 AI 如何改变前端开发流程，从代码生成到智能调试...": { en: "Exploring how AI changes the frontend development process, from code generation to intelligent debugging...", ja: "AIがフロントエンド開発プロセスをどのように変えるか、コード生成からインテリジェントデバッグまで探索..."
 },
  "从零搭建 Rust + WebAssembly 高性能服务": { en: "Building high-performance Rust + WebAssembly services from scratch", ja: "ゼロから構築する高性能 Rust + WebAssembly サービス" },
  "使用 Rust 编写核心逻辑，编译为 WASM 在浏览器中运行...": { en: "Write core logic in Rust, compile to WASM and run in the browser...", ja: "Rust でコア ロジックを記述し、WASM にコンパイルしてブラウザで実行..."
 },
  "我的 AI 绘画工作流分享": { en: "My AI Painting Workflow Sharing", ja: "私のAI絵画ワークフロー共有" },
  "从 Stable Diffusion 到 ComfyUI，打造个人创作管线...": { en: "From Stable Diffusion to ComfyUI, creating a personal creative pipeline...", ja: "Stable Diffusion から ComfyUI まで、個人的な創造パイプラインを構築..."
 },
  "京都赏枫摄影手记": { en: "Kyoto Autumn Foliage Photography Notes", ja: "京都の紅葉写真手記" },
  "十一月的京都，红叶如火。用镜头记录这座古都的秋色...": { en: "November in Kyoto, maple leaves like fire. Recording this ancient capital's autumn colors with the lens...", ja: "11月の京都、紅葉が炎のように。レンズでこの古都の秋の色を記録..."
 },
  "HomeLab 2026：我的家庭服务器集群": { en: "HomeLab 2026: My Home Server Cluster", ja: "HomeLab 2026：私のホームサーバークラスタ" },
  "从单台 N100 到 3 节点 K8s 集群的进化之路...": { en: "The evolution from a single N100 to a 3-node K8s cluster...", ja: "単一の N100 から 3 ノード K8s クラスタへの進化..."
 },
  "开源一年：我的 GitHub 成长记录": { en: "One Year of Open Source: My GitHub Growth Story", ja: "オープンソース1年：私のGitHub成長記録" },
  "从第一个 PR 到维护 3 个千星项目的心路历程...": { en: "From the first PR to maintaining 3 thousand-star projects...", ja: "最初の PR から 3 つの千星プロジェクトの保守まで..."
 },
  
  // ===== 留言页 =====
  "用户昵称": { en: "Username", ja: "ユーザー名" },
  "回复": { en: "Reply", ja: "返信" },
  
  // ===== 友链页 =====
  "前端开发 / 摄影爱好者": { en: "Frontend developer / photography enthusiast", ja: "フロントエンド開発者 / 写真愛好家" },
  "后端架构 / 分布式系统": { en: "Backend architect / distributed systems", ja: "バックエンドアーキテクト / 分散システム" },
  "UI/UX 设计 / 插画创作": { en: "UI/UX designer / illustration creator", ja: "UI/UXデザイナー / イラストレーター" },
  "机器学习 / NLP / 论文解读": { en: "Machine learning / NLP / paper interpretation", ja: "機械学習 / NLP / 論文解釈" },
  "独立游戏开发 / Unity / Godot": { en: "Indie game developer / Unity / Godot", ja: "インディーゲーム開発者 / Unity / Godot" },
  "DevOps / K8s / 云原生": { en: "DevOps / K8s / cloud native", ja: "DevOps / K8s / クラウドネイティブ" },
  
  // ===== 照片页 =====
  "照片墙": { en: "Photo Gallery", ja: "フォトギャラリー" },
  "用镜头记录生活的每一个瞬间 📸": { en: "Recording every moment of life with the camera 📸", ja: "カメラで人生の瞬間を記録する 📸" },
  "张照片": { en: "photos", ja: "枚の写真" },
  "这个相册还没有照片": { en: "No photos in this album yet", ja: "このアルバムにはまだ写真がありません" },
  
  // ===== 归档页 =====
  "共 {count} 篇文章，记录成长的每一步": { en: "{count} articles total, recording every step of growth", ja: "全 {count} 記事、成長の各ステップを記録" },
  "篇": { en: "articles", ja: "記事" },
  "8月": { en: "August", ja: "8月" },
  "7月": { en: "July", ja: "7月" },
  "6月": { en: "June", ja: "6月" },
  "5月": { en: "May", ja: "5月" },
  "12月": { en: "December", ja: "12月" },
  "10月": { en: "October", ja: "10月" },
  "2026年前端开发趋势": { en: "2026 Frontend Development Trends", ja: "2026年フロントエンド開発トレンド" },
  "用 Rust 重写博客引擎": { en: "Rewriting the blog engine in Rust", ja: "ブログエンジンを Rust で書き換える" },
  "AI 绘画工作流": { en: "AI Painting Workflow", ja: "AI 絵画ワークフロー" },
  "京都赏枫摄影": { en: "Kyoto Autumn Photography", ja: "京都秋写真" },
  "HomeLab 搭建记录": { en: "HomeLab Setup Log", ja: "HomeLab 構築ログ" },
  "开源一年记录": { en: "One Year of Open Source", ja: "オープンソース1年" },
  "Next.js 16 新特性解读": { en: "Next.js 16 New Features Explained", ja: "Next.js 16 新機能解説" },
  "Docker 多阶段构建优化": { en: "Docker Multi-stage Build Optimization", ja: "Docker マルチステージビルド最適化" },
  "我的阅读清单": { en: "My Reading List", ja: "私の読書リスト" },
  "PostgreSQL 性能调优": { en: "PostgreSQL Performance Tuning", ja: "PostgreSQL パフォーマンスチューニング" },
  "CSS 动画技巧合集": { en: "CSS Animation Tips Collection", ja: "CSS アニメーションテクニック集" },
  "2025 年终总结": { en: "2025 Year-end Summary", ja: "2025 年末サマリー" },
  "年度最佳工具推荐": { en: "Best Tools of the Year", ja: "年間最高ツール推奨" },
  "从零学习 Kubernetes": { en: "Learning Kubernetes from Scratch", ja: "ゼロから学ぶ Kubernetes" },
  "TypeScript 高级类型体操": { en: "Advanced TypeScript Type Gymnastics", ja: "TypeScript 高度な型体操" },
  
  // ===== 音乐页 =====
  "音乐库": { en: "Music Library", ja: "音楽ライブラリ" },
  "纯音乐精选": { en: "Instrumental Selections", ja: "楽器精選" },
  "播放列表": { en: "Playlist", ja: "プレイリスト" },
  "收藏": { en: "Favorites", ja: "お気に入り" },
  "播放全部": { en: "Play all", ja: "すべて再生" },
  "播放速度": { en: "Playback speed", ja: "再生速度" },
  "音量": { en: "Volume", ja: "ボリューム" },
  "歌词": { en: "Lyrics", ja: "歌詞" },
  
  // ===== 视频页 =====
  "视频库": { en: "Video Library", ja: "ビデオライブラリ" },
  "技术分享": { en: "Tech Sharing", ja: "技術シェアリング" },
  "Vlog": { en: "Vlog", ja: "Vlog" },
  "教程": { en: "Tutorial", ja: "チュートリアル" },
  "用 Next.js 16 搭建博客全流程": { en: "Building a Blog with Next.js 16 - Complete Guide", ja: "Next.js 16 でブログを構築 - 完全ガイド" },
  "我的 HomeLab 之旅 | 2026 Edition": { en: "My HomeLab Journey | 2026 Edition", ja: "私の HomeLab 旅行 | 2026 版" },
  "React Server Components 深度解析": { en: "React Server Components - Deep Dive", ja: "React Server Components - 詳細解析" },
  "Lo-Fi 编程音乐 | 2小时专注": { en: "Lo-Fi Programming Music | 2 Hours Focus", ja: "Lo-Fi プログラミング音楽 | 2 時間集中" },
  "Docker 从入门到实战": { en: "Docker from Beginner to Expert", ja: "Docker 初心者から実践まで" },
  "周末骑行 Vlog | 环湖之旅": { en: "Weekend Cycling Vlog | Lake Loop Journey", ja: "週末サイクリング Vlog | 湖周辺ツアー" },
  "25:30": { en: "25:30", ja: "25:30" },
  "18:45": { en: "18:45", ja: "18:45" },
  "32:15": { en: "32:15", ja: "32:15" },
  "2:00:00": { en: "2:00:00", ja: "2:00:00" },
  "42:00": { en: "42:00", ja: "42:00" },
  "12:30": { en: "12:30", ja: "12:30" },
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