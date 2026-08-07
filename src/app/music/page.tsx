"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { useSettings } from "@/context/SettingsContext";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Music, Heart,
} from "lucide-react";

// —— 真实可播放的免费 MP3（SoundHelix，免版权）——
// 想用自己的歌：把 src 换成你的 mp3 直链，或放进 public/music/ 后写 "/music/xxx.mp3"
const SH = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
  liked: boolean;
}

const COVERS = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop",
];

const allSongs: Song[] = [
  { id: 1, title: "Midnight Coding", artist: "LoFi Beats", album: "深夜编程", src: SH(1), cover: COVERS[0], liked: true },
  { id: 2, title: "Neural Network", artist: "Synthwave", album: "深夜编程", src: SH(2), cover: COVERS[1], liked: false },
  { id: 3, title: "Debug Mode", artist: "Chillhop", album: "深夜编程", src: SH(3), cover: COVERS[2], liked: true },
  { id: 4, title: "Café Window", artist: "Jazz Trio", album: "午后咖啡", src: SH(4), cover: COVERS[3], liked: false },
  { id: 5, title: "Autumn Leaves", artist: "Piano Solo", album: "午后咖啡", src: SH(5), cover: COVERS[4], liked: true },
  { id: 6, title: "Starlight Drive", artist: "Retro Wave", album: "公路旅行", src: SH(6), cover: COVERS[5], liked: false },
  { id: 7, title: "Ocean Breeze", artist: "Ambient", album: "自然之声", src: SH(7), cover: COVERS[6], liked: true },
  { id: 8, title: "City Lights", artist: "Electronic", album: "都市夜行", src: SH(8), cover: COVERS[7], liked: false },
];

const playlists = [
  { name: "深夜编程", cover: COVERS[0], ids: [1, 2, 3] },
  { name: "午后咖啡", cover: COVERS[4], ids: [4, 5] },
  { name: "公路旅行", cover: COVERS[5], ids: [6] },
  { name: "自然之声", cover: COVERS[6], ids: [7] },
];

// 秒 → m:ss
const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function MusicPage() {
  const { settings } = useSettings();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [index, setIndex] = useState(0);            // 当前歌曲在 allSongs 中的下标
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState<Record<number, boolean>>(
    Object.fromEntries(allSongs.map((s) => [s.id, s.liked]))
  );
  const [loadError, setLoadError] = useState(false);

  const current = allSongs[index];

  // —— 切歌时：换源 + 自动播放 ——
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setLoadError(false);
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [index]);

  // —— 音量 / 静音同步到 audio ——
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // —— 下一首（考虑随机）——
  const next = useCallback(() => {
    if (shuffle) {
      let r = Math.floor(Math.random() * allSongs.length);
      if (allSongs.length > 1 && r === index) r = (r + 1) % allSongs.length;
      setIndex(r);
    } else {
      setIndex((i) => (i + 1) % allSongs.length);
    }
  }, [shuffle, index]);

  const prev = () => {
    const audio = audioRef.current;
    // 播放超过 3 秒则重头，否则上一首
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
    if (i === index) {
      togglePlay();
    } else {
      setIndex(i);
    }
  };

  const playPlaylist = (ids: number[]) => {
    const first = allSongs.findIndex((s) => s.id === ids[0]);
    if (first >= 0) setIndex(first);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      {/* 隐藏的 audio 元素 —— 真正的播放器 */}
      <audio
        ref={audioRef}
        src={current.src}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={onEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => {
          setLoadError(true);
          setIsPlaying(false);
        }}
      />

      <SectionTitle title="音乐" subtitle="代码与旋律，都是生活的节拍 🎶" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Player Card */}
        <div className="lg:col-span-1">
          <GlassCard className="text-center sticky top-24">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={isPlaying ? { repeat: Infinity, duration: 8, ease: "linear" } : {}}
              className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-200 dark:ring-indigo-800"
            >
              <img src={current.cover} alt="Album" className="w-full h-full object-cover" />
            </motion.div>

            <h3 className="font-bold text-lg">{current.title}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {current.artist} · {current.album}
            </p>

            {loadError && (
              <p className="text-xs text-rose-400 mb-3">
                ⚠️ 音频加载失败，请检查网络或更换音源
              </p>
            )}

            {/* 真实进度条 */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={seek}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={`transition-colors ${shuffle ? "accent-text" : "text-gray-400 hover:text-indigo-500"}`}
                title="随机播放"
              >
                <Shuffle size={16} />
              </button>
              <button onClick={prev} className="text-gray-400 hover:text-indigo-500 transition-colors" title="上一首">
                <SkipBack size={20} />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30"
                title={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </motion.button>
              <button onClick={next} className="text-gray-400 hover:text-indigo-500 transition-colors" title="下一首">
                <SkipForward size={20} />
              </button>
              <button
                onClick={() => setRepeat((r) => !r)}
                className={`transition-colors ${repeat ? "accent-text" : "text-gray-400 hover:text-indigo-500"}`}
                title="单曲循环"
              >
                <Repeat size={16} />
              </button>
            </div>

            {/* 音量 */}
            <div className="flex items-center gap-2 mt-6 px-4">
              <button onClick={() => setMuted((m) => !m)} className="text-gray-400 hover:text-indigo-500">
                {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setMuted(false);
                  setVolume(Number(e.target.value));
                }}
                className="flex-1 accent-indigo-500"
              />
            </div>
          </GlassCard>
        </div>

        {/* Song List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Playlists */}
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

          {/* All Songs */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Music size={16} className="accent-text" /> 全部歌曲
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {allSongs.map((song, i) => {
                const active = index === i;
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
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity }}>♪</motion.span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <img src={song.cover} alt="" className="w-9 h-9 rounded-md object-cover hidden sm:block" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${active ? "accent-text" : ""}`}>
                        {song.title}
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
                    <span className="text-xs text-gray-400 w-10 text-right">{fmt(duration && active ? duration : 0)}</span>
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