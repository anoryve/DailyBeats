import { useState, useEffect, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Track } from "./types";
import { SynthEngine } from "./lib/SynthEngine";
import AlbumCover from "./components/AlbumCover";
import AmbientParticles from "./components/AmbientParticles";
import { 
  Sparkles, 
  Sunrise, 
  Heart, 
  Briefcase, 
  Compass, 
  Moon, 
  HelpCircle, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Share2, 
  Shuffle, 
  Repeat, 
  Check, 
  Music,
  SkipBack,
  SkipForward,
  Loader2
} from "lucide-react";

// Initial premium tracks
const initialAlbum: Track[] = [
  {
    trackNumber: 1,
    title: "晨光吐司 (Morning Toast)",
    story: "闹钟轻柔响起。厨房里传来面包机清脆的跳起声，还有咖啡机温润的滤滴声。全家人围坐在餐桌旁，和煦温暖 of 朝阳洒在金黄的荷包蛋上。伴随着舒缓柔和、带着淡淡空气感的清晨低慢节奏，一天的序章在温暖与面包香气中悄然拉开。",
    lyrics: "金色的晨光落在窗台 / 咖啡的香气慢慢晕开 / 睡眼惺忪的你轻轻笑起来 / 这一天，是最温情的序排",
    tempoMultiplier: 1.0,
    visualColor: "#f59e0b", // Amber
    soundEffects: ["晨鸟啁啾", "时钟滴答", "咖啡气泡声"],
    musicStyle: "舒缓温暖Lo-Fi氛围电音"
  },
  {
    trackNumber: 2,
    title: "校门告别 (School Gate Goodbye)",
    story: "来到校门口，孩子背着小小的书包，轻轻攥着爸爸妈妈的衣角，清澈的眼睛里写满了不愿分离的小情绪。大人们笑着蹲下身，给了一个长长的拥抱与额头轻吻。伴随着宛如八音盒般清脆、却略带迟滞与切分感的节奏，孩子一步三回头地走入校门，那一刻的不舍化作风中的小小挥手。",
    lyrics: "背上小小的书包 / 攥紧衣角，轻轻地摇 / 宝贝，去探索属于你的世界吧 / 下午见，我的骄傲",
    tempoMultiplier: 1.12,
    visualColor: "#ec4899", // Pink
    soundEffects: ["上课铃声", "孩子欢笑声", "风吹树叶声"],
    musicStyle: "清脆八音盒质感切分音电子"
  },
  {
    trackNumber: 3,
    title: "格子间律动 (Office Beat)",
    story: "上午10点，写字楼里的键盘敲击声飞快起伏，数据在屏幕间穿梭；而另一边的教室里，老师在黑板上沙沙书写，孩子们聚精会神，铅笔在绘图纸上勾勒出天马行空的梦想。极具数码律动、利落紧凑而毫无嘈杂感的极简电子鼓点，正演绎着两代人在各自空间里忙碌而专注的奋斗乐章。",
    lyrics: "键盘清脆的律动 / 铅笔在纸上追赶彩虹 / 我们在不同的空间里奔跑 / 呼吸着同样的奋斗与梦",
    tempoMultiplier: 1.25,
    visualColor: "#06b6d4", // Cyan
    soundEffects: ["键盘敲击", "沙沙粉笔声", "数字气泡"],
    musicStyle: "极简数码律动IDM节拍"
  },
  {
    trackNumber: 4,
    title: "夕阳重逢 (Sunset Reunion)",
    story: "晚霞将城市染成温润的玫瑰金色。放学出校的大片人群、晚高峰的喧闹街道。当穿过人群远远望见彼此的身影，孩子飞奔过来扑入怀中，那一瞬所有工作的疲惫在欢笑中彻底烟消云散。厨房里锅碗瓢盆轻响，饭菜腾起的热气模糊了玻璃，充满幸福感的暖色House电音诉说着踏实的团圆。",
    lyrics: "落日把影子拉得好长好长 / 远远地，看见了你的方向 / 奔跑过来吧，抱个满怀 / 厨房的灯光，已经点亮",
    tempoMultiplier: 1.15,
    visualColor: "#f97316", // Orange
    soundEffects: ["汽车鸣笛声", "沸沸锅铲声", "推门欢呼声"],
    musicStyle: "暖色House电子舞曲"
  },
  {
    trackNumber: 5,
    title: "星空安眠 (Starry Night)",
    story: "夜幕四合。洗过热水澡，换上柔软的棉质睡衣。一家人靠在沙发上，静静翻阅一本书，讲一个轻声细语的枕边故事。台灯被调成极柔和的暖黄，呼吸渐渐变得深沉、均匀。轻柔如水波漂浮的Lo-Fi氛围电子音效，伴着窗外静静的虫鸣与点点星河，温柔地守护着一整夜的安稳甜梦。",
    lyrics: "月亮挂在树梢 / 晚风把喧嚣都吹跑 / 闭上双眼，听心跳的声音 / 宝贝，晚安，睡个好觉",
    tempoMultiplier: 0.82,
    visualColor: "#6366f1", // Indigo
    soundEffects: ["夏夜虫鸣", "轻柔摇篮曲", "微风拂过"],
    musicStyle: "梦幻深邃Lo-Fi助眠氛围电子"
  }
];

export default function App() {
  const [album, setAlbum] = useState<Track[]>(initialAlbum);
  const [activeTrackIdx, setActiveTrackIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  // Dynamic precise high-fidelity full track duration mapping
  const trackDurations: { [key: number]: number } = {
    1: 252, // 04:12
    2: 235, // 03:55
    3: 318, // 05:18
    4: 285, // 04:45
    5: 220, // 03:40
  };

  const playStartTimeRef = useRef<number | null>(null);
  const elapsedOffsetRef = useRef<number>(0);

  // Playback timeline progress synced with full track duration
  const [playbackProgress, setPlaybackProgress] = useState({ elapsed: 0, total: 252, percentage: 0 });
  
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean[]>(Array(5).fill(false));
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const synthEngineRef = useRef<SynthEngine | null>(null);

  // Initialize SynthEngine once on component mount
  useEffect(() => {
    const engine = new SynthEngine();
    synthEngineRef.current = engine;

    // Fetch the album metadata initially
    fetch("/api/album/default")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.album) {
          setAlbum(data.album);
        }
      })
      .catch((err) => console.error("Failed to load initial album", err));

    return () => {
      engine.stop();
    };
  }, []);

  // Sync volume
  useEffect(() => {
    const engine = synthEngineRef.current;
    if (engine) {
      engine.setVolume(volume);
    }
  }, [volume]);

  // Set track in engine and reload/preload audio buffers
  useEffect(() => {
    const engine = synthEngineRef.current;
    if (!engine || album.length === 0) return;

    const currentTrack = album[activeTrackIdx];
    engine.setTrack(
      currentTrack.trackNumber,
      (loading) => setIsAudioLoading(loading)
    );
  }, [activeTrackIdx, album]);

  // Handle play/pause toggles
  useEffect(() => {
    const engine = synthEngineRef.current;
    if (!engine) return;

    if (isPlaying) {
      engine.start((step) => {
        setCurrentStep(step);
      });
      playStartTimeRef.current = Date.now();
    } else {
      engine.stop();
      if (playStartTimeRef.current !== null) {
        elapsedOffsetRef.current += (Date.now() - playStartTimeRef.current) / 1000;
      }
      playStartTimeRef.current = null;
    }
  }, [isPlaying]);

  const activeTrack = album[activeTrackIdx] || initialAlbum[0];
  const totalDuration = trackDurations[activeTrack.trackNumber] || 240;

  // Track switching resets the timer offset
  useEffect(() => {
    elapsedOffsetRef.current = 0;
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    } else {
      playStartTimeRef.current = null;
    }
  }, [activeTrackIdx]);

  // Query playback progress in real-time
  useEffect(() => {
    let animId: number;
    const updateProgress = () => {
      let currentElapsed = elapsedOffsetRef.current;
      if (isPlaying && playStartTimeRef.current !== null) {
        currentElapsed = elapsedOffsetRef.current + (Date.now() - playStartTimeRef.current) / 1000;
        
        if (currentElapsed >= totalDuration) {
          if (isRepeat) {
            elapsedOffsetRef.current = 0;
            playStartTimeRef.current = Date.now();
            currentElapsed = 0;
          } else {
            handleNextTrack();
            return;
          }
        }
      }

      setPlaybackProgress({
        elapsed: Math.floor(currentElapsed),
        total: totalDuration,
        percentage: Math.min(100, (currentElapsed / totalDuration) * 100),
      });

      animId = requestAnimationFrame(updateProgress);
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeTrackIdx, isRepeat, isShuffle, totalDuration]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentStep(0);
    elapsedOffsetRef.current = 0;
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * album.length);
      setActiveTrackIdx(randomIdx);
    } else {
      setActiveTrackIdx((prev) => (prev + 1) % album.length);
    }
  };

  const handlePrevTrack = () => {
    setCurrentStep(0);
    elapsedOffsetRef.current = 0;
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }
    setActiveTrackIdx((prev) => (prev - 1 + album.length) % album.length);
  };

  const handleJumpToTrack = (index: number) => {
    setCurrentStep(0);
    elapsedOffsetRef.current = 0;
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }
    setActiveTrackIdx(index);
  };

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newSeconds = ratio * totalDuration;

    elapsedOffsetRef.current = newSeconds;
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }
    setPlaybackProgress({
      elapsed: Math.floor(newSeconds),
      total: totalDuration,
      percentage: ratio * 100
    });
  };

  // Convert seconds to MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  // Call the server-side Gemini API to rewrite the storytelling tracks
  const toggleLikeTrack = (index: number, e: MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleShareAlbum = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getTimelineIcon = (num: number, color: string) => {
    const sizeClass = "h-4 w-4 shrink-0";
    switch (num) {
      case 1: return <Sunrise className={sizeClass} style={{ color }} />;
      case 2: return <Heart className={sizeClass} style={{ color }} />;
      case 3: return <Briefcase className={sizeClass} style={{ color }} />;
      case 4: return <Compass className={sizeClass} style={{ color }} />;
      case 5: return <Moon className={sizeClass} style={{ color }} />;
      default: return <Sparkles className={sizeClass} style={{ color }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#3c332e] font-sans flex flex-col selection:bg-[#f3ede4] selection:text-[#3c332e] pb-28 relative overflow-x-hidden">
      
      {/* Immersive Atmospheric Gradient */}
      <div className="absolute top-0 left-0 w-full h-[550px] overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-30%] left-[20%] w-[70%] h-[80%] rounded-full filter blur-[140px] opacity-25 transition-all duration-1000"
          style={{ backgroundColor: activeTrack.visualColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#faf7f2]" />
      </div>

      {/* Dynamic SVG Ambient Particles background */}
      <AmbientParticles color={activeTrack.visualColor} isPlaying={isPlaying} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 mt-6 sm:mt-10">
        
        {/* ==================== 1. BRAND NEW ALBUM DETAILS BUBBLE (Streaming Style) ==================== */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 bg-white/70 border border-[#ede5db] p-6 rounded-3xl backdrop-blur-md shadow-sm">
          {/* Cover Art Wrapper */}
          <div 
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden relative shadow-lg shrink-0 group border border-[#ede5db]"
          >
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent opacity-40 z-10"
            />
            <img 
              src={`https://picsum.photos/seed/family-beats-${activeTrackIdx}/400/400`} 
              alt="Album cover" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Overlay Play State */}
            {isPlaying && (
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#ede5db] text-[10px] font-mono font-bold tracking-wider text-[#3c332e]">
                <span className="flex gap-[2px] items-end h-2 w-2">
                  <span className="bg-[#3c332e] w-[2px] h-full animate-pulse" />
                  <span className="bg-[#3c332e] w-[2px] h-[60%] animate-pulse delay-75" />
                  <span className="bg-[#3c332e] w-[2px] h-[80%] animate-pulse delay-150" />
                </span>
                PLAYING
              </div>
            )}
          </div>

          {/* Metadata Block */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-end">
            <span className="text-[10px] font-mono tracking-widest text-[#9e887a] uppercase font-bold">
              AI Concept Album / 智能概念电音专辑
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#3c332e] tracking-tight mt-2 leading-none font-serif">
              Daily Beats: 家庭日常
            </h1>
            <p className="text-sm text-[#6e5d54] mt-3 font-sans leading-relaxed max-w-2xl">
              讲述一个温馨家庭从“晨光吐司”、“校门告别”到“格子间律动”、“夕阳重逢”再到“星空安眠”的完整日常。节奏感强烈、情绪递进却毫不嘈杂，在极简电子乐中折射出家人的深深牵绊。
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 mt-4 text-xs font-mono text-[#9e887a]">
              <span className="text-[#5c4a40] font-semibold">Generative Family AI</span>
              <span className="hidden md:inline">•</span>
              <span>2026</span>
              <span>•</span>
              <span>5 首单曲, 高品质立体声 16-bit WAV</span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePlayToggle}
                disabled={isAudioLoading}
                className="flex items-center gap-2 py-2.5 px-6 rounded-full text-xs font-bold text-white bg-[#5c4a40] hover:bg-[#4d3d34] transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isAudioLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    音频加载中...
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 fill-current stroke-none" />
                    暂停播放
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current stroke-none translate-x-[0.5px]" />
                    开始播放
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleShareAlbum}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-semibold text-[#5c4a40] bg-[#f5ebe0] hover:bg-[#eadbc8] border border-[#e0cfbe] transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    已复制链接
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    分享专辑
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ==================== 2. TWO-COLUMN HIGH-FIDELITY DASHBOARD ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
          
          {/* LEFT PANEL: Professional Spotify-style Track Table [7 cols] */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-3xl border border-[#ede5db] bg-white/70 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#f3ede4] mb-3">
                <h2 className="text-sm font-bold tracking-wider font-mono text-[#5c4a40] uppercase flex items-center gap-2">
                  <ListMusic className="h-4 w-4" />
                  Album Tracks / 专辑收录曲目
                </h2>
                <span className="text-xs text-[#9e887a] font-mono">点击切换单曲进行即时生成与播放</span>
              </div>

              {/* Responsive Table Grid */}
              <div className="flex flex-col divide-y divide-[#f5ebe0]/60 relative z-0">
                {album.map((track, index) => {
                  const isActive = activeTrackIdx === index;
                  return (
                    <motion.div
                      key={track.trackNumber}
                      onClick={() => handleJumpToTrack(index)}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="group flex items-center justify-between py-3.5 px-3 rounded-xl cursor-pointer relative z-10 transition-colors"
                    >
                      {/* Sliding active track highlight */}
                      {isActive && (
                        <motion.div
                          layoutId="active-track-indicator"
                          className="absolute inset-0 bg-[#f5ebe0]/80 border border-[#e3d5c5] rounded-xl shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        />
                      )}

                      {/* Left: Track # and Icon and Title */}
                      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {isActive && isPlaying ? (
                            <span className="flex gap-[2.5px] items-end h-3">
                              <span className="bg-[#be5a38] w-[2.5px] h-full origin-bottom animate-[bounce_0.8s_infinite]" style={{ animationDelay: "0s" }} />
                              <span className="bg-[#be5a38] w-[2.5px] h-[50%] origin-bottom animate-[bounce_0.8s_infinite]" style={{ animationDelay: "0.2s" }} />
                              <span className="bg-[#be5a38] w-[2.5px] h-[75%] origin-bottom animate-[bounce_0.8s_infinite]" style={{ animationDelay: "0.4s" }} />
                            </span>
                          ) : isActive && isAudioLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin text-[#be5a38]" />
                          ) : isActive ? (
                            <Play className="h-3.5 w-3.5 text-[#be5a38] fill-current" />
                          ) : (
                            <Music className="h-3.5 w-3.5 text-[#9e887a] group-hover:text-[#5c4a40] transition-colors" />
                          )}
                        </div>

                        {/* Theme Icon Indicator */}
                        <div className="p-1 rounded bg-[#faf7f2] border border-[#ede5db] shrink-0">
                          {getTimelineIcon(track.trackNumber, track.visualColor)}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-medium truncate ${isActive ? "text-[#3c332e] font-semibold" : "text-[#5c4a40] group-hover:text-[#3c332e]"}`}>
                            {track.title}
                          </span>
                          <span className="text-[11px] text-[#9e887a] font-mono mt-0.5 uppercase tracking-wide flex items-center gap-1.5">
                            <span>BPM: {Math.round(100 * track.tempoMultiplier)}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">风格: {track.musicStyle || "AI氛围电音"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions, Likes & Timeline info */}
                      <div className="flex items-center gap-4 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => toggleLikeTrack(index, e)}
                          className={`p-1.5 rounded-full hover:bg-[#eadbc8] transition-colors ${
                            isLiked[index] ? "text-rose-500" : "text-[#9e887a] hover:text-[#5c4a40]"
                          }`}
                          title="Like Track"
                        >
                          <Heart className={`h-4 w-4 ${isLiked[index] ? "fill-current" : ""}`} />
                        </motion.button>

                        <span className="text-xs font-mono text-[#9e887a] w-10 text-right">
                          00:15
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* RIGHT PANEL: Tactile Record Player, Narrative and Lyrics [5 cols] */}
          <section className="lg:col-span-5 h-full flex flex-col gap-6">
            <AlbumCover
              track={activeTrack}
              isPlaying={isPlaying}
              analyser={synthEngineRef.current?.analyser || null}
            />
          </section>

        </div>

        {/* Ambient Helpful Guide Bottom Card */}
        <div className="mt-4 rounded-3xl bg-[#f5ebe0]/40 border border-[#ede5db] p-5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#857368] gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#a39081] shrink-0" />
            <span>这是一个 <strong>Gemini AI (Lyria/WAV Engine)</strong> 直接生成成品单曲的概念电子专辑，无需在页面本地编排合成。高品质16位WAV立体声保证节奏纯净且富有质感。</span>
          </div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-[#857368]">
            Engine Core v3.0 • AI-Mastered Audio
          </div>
        </div>

      </div>

      {/* ==================== 3. FLOATING "NOW PLAYING" DESKTOP FOOTER CONTROL BAR ==================== */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#faf7f2]/95 backdrop-blur-md border-t border-[#ede5db] py-3.5 px-6 z-50 flex flex-col gap-2 shadow-[0_-10px_30px_rgba(139,115,92,0.1)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          
          {/* Left Block: Track Mini-Thumbnail */}
          <div className="flex items-center gap-3 w-1/4 min-w-[150px]">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#faf7f2] shrink-0 border border-[#ede5db]">
              <img 
                src={`https://picsum.photos/seed/family-beats-${activeTrackIdx}/80/80`} 
                alt="Track Mini" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-xs font-semibold text-[#3c332e] truncate max-w-[160px] sm:max-w-none font-sans">
                {activeTrack.title}
              </span>
              <span className="text-[10px] text-[#9e887a] font-mono mt-0.5 truncate uppercase">
                {activeTrack.musicStyle || "AI氛围电音"}
              </span>
            </div>
          </div>

          {/* Center Block: Playback Controller with Live Progress Timeline */}
          <div className="flex-1 flex flex-col items-center gap-2 max-w-[500px]">
            {/* Tactile Media Buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${isShuffle ? "text-emerald-600" : "text-[#9e887a] hover:text-[#5c4a40]"}`}
                title="Shuffle"
              >
                <Shuffle className="h-3.5 w-3.5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={handlePrevTrack}
                className="text-[#9e887a] hover:text-[#5c4a40] transition-colors cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="h-4.5 w-4.5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handlePlayToggle}
                disabled={isAudioLoading}
                className="p-2.5 rounded-full text-white shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: activeTrack.visualColor }}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isAudioLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 fill-current stroke-none" />
                ) : (
                  <Play className="h-4 w-4 fill-current stroke-none translate-x-[0.5px]" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleNextTrack}
                className="text-[#9e887a] hover:text-[#5c4a40] transition-colors cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="h-4.5 w-4.5 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${isRepeat ? "text-emerald-600" : "text-[#9e887a] hover:text-[#5c4a40]"}`}
                title="Loop track"
              >
                <Repeat className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            {/* Real Active Song Progress Bar */}
            <div className="w-full flex items-center gap-2.5">
              <span className="text-[9px] font-mono text-[#9e887a] select-none">
                {formatTime(playbackProgress.elapsed)}
              </span>
              
              <div 
                onClick={handleProgressClick}
                className="flex-1 h-1.5 rounded bg-[#ede5db] relative group cursor-pointer overflow-hidden transition-all hover:h-2"
                title="Click to seek"
              >
                <div 
                  className="absolute left-0 top-0 h-full transition-all duration-75 group-hover:brightness-105"
                  style={{ 
                    width: `${playbackProgress.percentage}%`,
                    backgroundColor: activeTrack.visualColor
                  }}
                />
              </div>

              <span className="text-[9px] font-mono text-[#9e887a] select-none">
                {formatTime(playbackProgress.total)}
              </span>
            </div>
          </div>

          {/* Right Block: Volume Controls and AI Style Info */}
          <div className="flex items-center justify-end gap-3.5 w-1/4 min-w-[150px]">
            {/* Live readout of AI music style details */}
            <div className="hidden sm:flex flex-col text-right pr-2 border-r border-[#ede5db] leading-none">
              <span className="text-[9px] font-mono text-[#9e887a] uppercase tracking-widest">
                AI Genre
              </span>
              <span className="text-xs font-mono font-bold text-[#3c332e] mt-0.5 truncate max-w-[110px]" title={activeTrack.musicStyle}>
                {activeTrack.musicStyle || "Lo-Fi Ambient"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#9e887a]">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="hover:text-[#5c4a40] transition-colors"
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-[#a39081]" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#ede5db] rounded-lg appearance-none cursor-pointer accent-[#5c4a40] hidden md:block"
              />
              <span className="text-[10px] font-mono text-[#9e887a]">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
