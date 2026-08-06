// src/app/music/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Music, Heart } from "lucide-react";

const playlists = [
  {
    name: "深夜编程",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    songs: [
      { title: "Midnight Coding", artist: "LoFi Beats", duration: "3:42" },
      { title: "Neural Network", artist: "Synthwave", duration: "4:15" },
      { title: "Debug Mode", artist: "Chillhop", duration: "3:28" },
    ],
  },
  {
    name: "午后咖啡",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
    songs: [
      { title: "Café Window", artist: "Jazz Trio", duration: "4:02" },
      { title: "Autumn Leaves", artist: "Piano Solo", duration: "3:55" },
    ],
  },
];

const allSongs = [
  { id: 1, title: "Midnight Coding", artist: "LoFi Beats", album: "深夜编程", duration: "3:42", liked: true },
  { id: 2, title: "Neural Network", artist: "Synthwave", album: "深夜编程", duration: "4:15", liked: false },
  { id: 3, title: "Debug Mode", artist: "Chillhop", album: "深夜编程", duration: "3:28", liked: true },
  { id: 4, title: "Café Window", artist: "Jazz Trio", album: "午后咖啡", duration: "4:02", liked: false },
  { id: 5, title: "Autumn Leaves", artist: "Piano Solo", album: "午后咖啡", duration: "3:55", liked: true },
  { id: 6, title: "Starlight Drive", artist: "Retro Wave", album: "公路旅行", duration: "5:01", liked: false },
  { id: 7, title: "Ocean Breeze", artist: "Ambient", album: "自然之声", duration: "6:30", liked: true },
  { id: 8, title: "City Lights", artist: "Electronic", album: "都市夜行", duration: "4:22", liked: false },
];

export default function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(allSongs[0]);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      <SectionTitle title="音乐" subtitle="代码与旋律，都是生活的节拍 🎶" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Player Card */}
        <div className="lg:col-span-1">
          <GlassCard className="text-center sticky top-24">
            {/* Album Art */}
            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={isPlaying ? { repeat: Infinity, duration: 8, ease: "linear" } : {}}
              className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-200 dark:ring-indigo-800"
            >
              <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
                alt="Album"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <h3 className="font-bold text-lg">{currentSong.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{currentSong.artist} · {currentSong.album}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1:{String(Math.floor(progress * 0.42)).padStart(2, "0")}</span>
                <span>{currentSong.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button className="text-gray-400 hover:text-indigo-500 transition-colors"><Shuffle size={16} /></button>
              <button className="text-gray-400 hover:text-indigo-500 transition-colors"><SkipBack size={20} /></button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </motion.button>
              <button className="text-gray-400 hover:text-indigo-500 transition-colors"><SkipForward size={20} /></button>
              <button className="text-gray-400 hover:text-indigo-500 transition-colors"><Repeat size={16} /></button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 mt-6 px-4">
              <Volume2 size={16} className="text-gray-400" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </GlassCard>
        </div>

        {/* Song List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Playlists */}
          <div className="grid grid-cols-2 gap-4">
            {playlists.map((pl, i) => (
              <GlassCard key={pl.name} delay={i * 0.1} className="flex items-center gap-4 !p-4 cursor-pointer">
                <img src={pl.cover} alt={pl.name} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h4 className="font-medium text-sm">{pl.name}</h4>
                  <p className="text-xs text-gray-400">{pl.songs.length} 首歌曲</p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* All Songs */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Music size={16} className="text-indigo-500" /> 全部歌曲
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {allSongs.map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setCurrentSong(song); setIsPlaying(true); }}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 ${
                    currentSong.id === song.id ? "bg-indigo-50/50 dark:bg-indigo-500/10" : ""
                  }`}
                >
                  <span className="text-xs text-gray-400 w-5 text-center">
                    {currentSong.id === song.id && isPlaying ? (
                      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity }}>♪</motion.span>
                    ) : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${currentSong.id === song.id ? "text-indigo-500" : ""}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-400">{song.artist}</p>
                  </div>
                  <span className="text-xs text-gray-400 hidden sm:block">{song.album}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className={song.liked ? "text-red-400" : "text-gray-300 hover:text-red-400"}
                  >
                    <Heart size={14} className={song.liked ? "fill-red-400" : ""} />
                  </button>
                  <span className="text-xs text-gray-400 w-10 text-right">{song.duration}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}