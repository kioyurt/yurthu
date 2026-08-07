"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useSettings } from "@/context/SettingsContext";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Music, Heart, AlignLeft, Mic2,
} from "lucide-react";
import type { Track, LyricLine } from "@/data/music";
import { getTracks, getLyrics } from "@/lib/api";

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function MusicPage() {
  const { settings } = useSettings();
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLParagraphElement>(null);

  // —— 数据状态 ——
  const [allSongs, setAllSongs] = useState<Track[]>([]);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // —— 播放状态 ——
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  // 🔧 修复1: 用 ref 追踪用户是否正在手动滚动，避免自动滚动打断用户操作
  const isUserScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();

  const current = allSongs[index] || null;

  // —— 1. 初始加载歌曲列表 ——
  useEffect(() => {
    (async () => {
      try {
        const songs = await getTracks();
        setAllSongs(songs);
        const initLiked: Record<string, boolean> = {};
        songs.forEach((s) => { initLiked[s.id] = false; });
        setLiked(initLiked);
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  // —— 2. 切歌时：换源 + 自动播放 + 加载歌词 ——
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    setLoadError(false);
    setCurrentTime(0);
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

    (async () => {
      const lrc = await getLyrics(current.id);
      setLyrics(lrc);
      // 切歌后重置滚动位置
      if (lyricContainerRef.current) {
        lyricContainerRef.current.scrollTop = 0;
      }
    })();
  }, [index, current?.id]);

    // —— 3. 音量 / 静音同步 ——
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // ✅ 先声明 activeLyricIndex（移到这里）
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, lyrics]);

  // 🔧 修复2: 监听用户滚动，暂停自动滚动 2 秒
  useEffect(() => {
    const container = lyricContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrolling.current = true;
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 2000);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔧 修复3: 用 scrollTo 替代 scrollBy，消除抖动
  //    现在 activeLyricIndex 已经在上面声明了，这里可以安全引用
  useEffect(() => {
    if (
      !activeLyricRef.current ||
      !lyricContainerRef.current ||
      isUserScrolling.current
    ) return;

    const container = lyricContainerRef.current;
    const activeEl = activeLyricRef.current;

    const containerHeight = container.clientHeight;
    const elTop = activeEl.offsetTop;
    const elHeight = activeEl.offsetHeight;
    const targetScroll = elTop - containerHeight / 2 + elHeight / 2;

    if (Math.abs(container.scrollTop - targetScroll) > 2) {
      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [activeLyricIndex, lyrics]);  // ← 现在不会报错了


  // —— 下一首 ——
  const next = useCallback(() => {
    if (!allSongs.length) return;
    if (shuffle) {
      let r = Math.floor(Math.random() * allSongs.length);
      if (allSongs.length > 1 && r === index) r = (r + 1) % allSongs.length;
      setIndex(r);
    } else {
      setIndex((i) => (i + 1) % allSongs.length);
    }
  }, [shuffle, index, allSongs.length]);

  const prev = () => {
    if (!allSongs.length) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 + allSongs.length) % allSongs.length);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playSong = (i: number) => {
    if (i === index) togglePlay();
    else setIndex(i);
  };

  const playlists = useMemo(() => {
    const map = new Map<string, { name: string; cover: string; ids: string[] }>();
    allSongs.forEach((s) => {
      const albumName = s.album || "未分类";
      if (!map.has(albumName)) {
        map.set(albumName, { name: albumName, cover: s.cover, ids: [] });
      }
      map.get(albumName)!.ids.push(s.id);
    });
    return Array.from(map.values());
  }, [allSongs]);

  const playPlaylist = (ids: string[]) => {
    const firstIdx = allSongs.findIndex((s) => s.id === ids[0]);
    if (firstIdx >= 0) setIndex(firstIdx);
  };

  const onEnded = () => {
    if (repeat) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } else {
      next();
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audio) audio.currentTime = t;
  };

  const seekToLyric = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
      // 点击跳转后立即恢复自动滚动
      isUserScrolling.current = false;
    }
  };

  if (dataLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!current) return null;

  const hasLyrics = lyrics.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      <audio
        ref={audioRef}
        src={current.src}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={onEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => { setLoadError(true); setIsPlaying(false); }}
      />

      <SectionTitle title="音乐" subtitle="代码与旋律，都是生活的节拍 🎶" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ===== 左栏：播放器 + 歌词一体化 ===== */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="sticky top-24 overflow-hidden">
            {/* 旋转封面 */}
            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={isPlaying ? { repeat: Infinity, duration: 8, ease: "linear" } : {}}
              className="w-44 h-44 mx-auto rounded-full overflow-hidden mb-5 shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-200 dark:ring-indigo-800"
            >
              <img src={current.cover} alt="Album" className="w-full h-full object-cover" />
            </motion.div>

            <h3 className="font-bold text-lg text-center">{current.title}</h3>
            <p className="text-sm text-gray-500 mb-5 text-center">
              {current.artist} · {current.album}
            </p>

            {loadError && (
              <p className="text-xs text-rose-400 mb-3 text-center">⚠️ 音频加载失败</p>
            )}

            {/* 进度条 */}
            <div className="mb-4 px-2">
              <input
                type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
                onChange={seek} className="w-full accent-indigo-500 h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={() => setShuffle((s) => !s)}
                className={`transition-colors ${shuffle ? "text-indigo-500" : "text-gray-400 hover:text-indigo-500"}`}
                title="随机播放"><Shuffle size={16} /></button>
              <button onClick={prev} className="text-gray-400 hover:text-indigo-500 transition-colors" title="上一首">
                <SkipBack size={20} /></button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30"
                title={isPlaying ? "暂停" : "播放"}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </motion.button>
              <button onClick={next} className="text-gray-400 hover:text-indigo-500 transition-colors" title="下一首">
                <SkipForward size={20} /></button>
              <button onClick={() => setRepeat((r) => !r)}
                className={`transition-colors ${repeat ? "text-indigo-500" : "text-gray-400 hover:text-indigo-500"}`}
                title="单曲循环"><Repeat size={16} /></button>
            </div>

            {/* 音量 */}
            <div className="flex items-center gap-2 px-6 mb-3">
              <button onClick={() => setMuted((m) => !m)} className="text-gray-400 hover:text-indigo-500 shrink-0">
                {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                onChange={(e) => { setMuted(false); setVolume(Number(e.target.value)); }}
                className="flex-1 accent-indigo-500 h-1 cursor-pointer" />
            </div>

            {/* 歌词切换 */}
            {hasLyrics && (
              <button
                onClick={() => setShowLyrics((v) => !v)}
                className={`flex items-center gap-1.5 mx-auto text-xs transition-colors pb-2 ${
                  showLyrics ? "text-indigo-500" : "text-gray-400 hover:text-indigo-500"
                }`}
              >
                <AlignLeft size={12} />
                {showLyrics ? "收起歌词" : "展开歌词"}
              </button>
            )}

            {/* 🔧 修复5: 歌词面板内嵌到播放器卡片中，不再割裂 */}
            <AnimatePresence>
              {showLyrics && hasLyrics && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2">
                    {/* 歌词头部 */}
                    <div className="px-4 py-2.5 flex items-center gap-2">
                      <Mic2 size={13} className="text-indigo-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">歌词</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{lyrics.length} 行</span>
                    </div>

                    {/* 歌词滚动区域 */}
                    <div
                      ref={lyricContainerRef}
                      className="relative max-h-56 overflow-y-auto px-6 py-2"
                      style={{ scrollbarWidth: "thin", maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
                    >
                      {/* 顶部留白 */}
                      <div className="h-16 shrink-0" />

                      {lyrics.map((line, i) => {
                        const isActive = i === activeLyricIndex;
                        return (
                          <p
                            key={`${line.time}-${i}`}
                            ref={isActive ? activeLyricRef : undefined}
                            onClick={() => seekToLyric(line.time)}
                            className={`
                              py-1.5 cursor-pointer transition-all duration-500 ease-out leading-relaxed
                              ${isActive
                                ? "text-indigo-500 dark:text-indigo-400 font-semibold text-[15px] scale-[1.03] origin-left"
                                : "text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300"
                              }
                            `}
                          >
                            {line.text}
                          </p>
                        );
                      })}

                      {/* 底部留白 */}
                      <div className="h-16 shrink-0" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 无歌词提示（也内嵌在卡片中） */}
            {!hasLyrics && !dataLoading && (
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2 py-6 text-center">
                <div className="text-2xl mb-2 opacity-60">🎵</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">纯音乐，请欣赏</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">用心感受旋律就好</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* ===== 右栏：歌单 + 歌曲列表 ===== */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {playlists.map((pl, i) => (
              <GlassCard
                key={pl.name}
                delay={i * 0.1}
                onClick={() => playPlaylist(pl.ids)}
                className="flex items-center gap-4 !p-4 cursor-pointer hover:border-indigo-400/50"
              >
                <img src={pl.cover} alt={pl.name} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h4 className="font-medium text-sm">{pl.name}</h4>
                  <p className="text-xs text-gray-400">{pl.ids.length} 首歌曲 · 点击播放</p>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Music size={16} className="text-indigo-500" /> 全部歌曲
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {allSongs.map((song, i) => {
                const active = index === i;
                const songHasLyrics = !!(song.lyrics && song.lyrics.length > 0);
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => playSong(i)}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 ${
                      active ? "bg-indigo-50/50 dark:bg-indigo-500/10" : ""
                    }`}
                  >
                    <span className="text-xs text-gray-400 w-5 text-center">
                      {active && isPlaying ? (
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>♪</motion.span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <img src={song.cover} alt="" className="w-9 h-9 rounded-md object-cover hidden sm:block" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate flex items-center gap-1.5 ${active ? "text-indigo-500" : ""}`}>
                        {song.title}
                        {songHasLyrics && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 font-normal">词</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{song.artist}</p>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">{song.album}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiked((p) => ({ ...p, [song.id]: !p[song.id] }));
                      }}
                      className={liked[song.id] ? "text-red-400" : "text-gray-300 hover:text-red-400"}
                    >
                      <Heart size={14} className={liked[song.id] ? "fill-red-400" : ""} />
                    </button>
                    <span className="text-xs text-gray-400 w-10 text-right">{fmt(song.duration)}</span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}