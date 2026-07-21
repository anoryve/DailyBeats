import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Track } from "../types";
import { Music, BookOpen, Quote } from "lucide-react";

interface AlbumCoverProps {
  track: Track;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
}

interface Star {
  angle: number;
  distance: number;
  speed: number;
  size: number;
}

export default function AlbumCover({
  track,
  isPlaying,
  analyser,
}: AlbumCoverProps) {
  const discRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const armRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistence of star coordinates for Track 5 theme
  const starsRef = useRef<Star[]>([]);
  if (starsRef.current.length === 0) {
    for (let i = 0; i < 24; i++) {
      starsRef.current.push({
        angle: Math.random() * Math.PI * 2,
        distance: 12 + Math.random() * 24,
        speed: (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
        size: Math.random() * 1.5 + 0.5,
      });
    }
  }

  // Spin duration of the vinyl record: scale with tempo multiplier (12 beats per rotation)
  const spinDuration = (60 / (120 * (track.tempoMultiplier || 1.0))) * 12;

  // Track sticker illustration seed URL
  const getSeedUrl = () => {
    switch (track.trackNumber) {
      case 1:
        return "https://picsum.photos/seed/sunrise-breakfast/400/400";
      case 2:
        return "https://picsum.photos/seed/school-gate/400/400";
      case 3:
        return "https://picsum.photos/seed/office-classroom/400/400";
      case 4:
        return "https://picsum.photos/seed/sunset-dinner/400/400";
      case 5:
        return "https://picsum.photos/seed/starry-night-home/400/400";
      default:
        return "https://picsum.photos/seed/family-album/400/400";
    }
  };

  // Real-time animation loop for both canvas drawing and DOM elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Handle high DPI screens elegantly
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisuals = () => {
      time += isPlaying ? (track.tempoMultiplier || 1.0) : 0.4;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Extract vinyl disc physical radius to anchor visualizer exactly at its rim
      const discElement = discRef.current;
      const r_disc = discElement ? discElement.offsetWidth / 2 : 112;

      // Dynamically calculate the exact physical center of the vinyl disc relative to the canvas
      let cx = width / 2;
      let cy = height / 2;
      if (canvas && discElement) {
        const canvasRect = canvas.getBoundingClientRect();
        const discRect = discElement.getBoundingClientRect();
        cx = (discRect.left + discRect.width / 2) - canvasRect.left;
        cy = (discRect.top + discRect.height / 2) - canvasRect.top;
      }

      // Check for real audio signal
      let hasRealAudio = false;
      if (analyser) {
        try {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          if (sum > 10) {
            hasRealAudio = true;
          }
        } catch (e) {
          hasRealAudio = false;
        }
      }

      // Calculate audio frequencies
      let bass = 0;
      let mid = 0;
      let treble = 0;

      if (hasRealAudio) {
        const len = dataArray.length;
        const bassEnd = Math.floor(len * 0.15);
        const midEnd = Math.floor(len * 0.6);

        for (let i = 0; i < bassEnd; i++) bass += dataArray[i];
        for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i];
        for (let i = midEnd; i < len; i++) treble += dataArray[i];

        bass = bassEnd > 0 ? bass / bassEnd : 0;
        mid = (midEnd - bassEnd) > 0 ? mid / (midEnd - bassEnd) : 0;
        treble = (len - midEnd) > 0 ? treble / (len - midEnd) : 0;
      } else {
        // High-fidelity smooth fallback pulses when paused or loading
        const pulseFactor = isPlaying ? 1.0 : 0.22;
        bass = (Math.sin(time * 0.05) * 15 + 32) * pulseFactor;
        mid = (Math.cos(time * 0.08) * 10 + 22) * pulseFactor;
        treble = (Math.sin(time * 0.12) * 6 + 12) * pulseFactor;
      }

      // 1. UPDATE PHYSICAL ELEMENT TRANSFORMS (60 FPS Performance)
      const pulse = 1.0 + (bass / 255) * 0.06;
      const glowScale = 1.0 + (bass / 255) * 0.5;
      const glowOpacity = 0.12 + (bass / 255) * 0.35;

      if (discRef.current) {
        discRef.current.style.transform = `scale(${pulse})`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `scale(${glowScale})`;
        glowRef.current.style.opacity = `${glowOpacity}`;
      }
      if (armRef.current) {
        const wobble = isPlaying ? Math.sin(Date.now() * 0.04) * 0.35 : 0;
        const baseRotation = isPlaying ? 18 : 0;
        armRef.current.style.transform = `rotate(${baseRotation + wobble}deg)`;
      }

      // 2. CLEAR CANVAS EVERY FRAME
      ctx.clearRect(0, 0, width, height);

      // Color from metadata
      const accentColor = track.visualColor || "#f59e0b";

      // 3. DRAW CUSTOM RADIAL THEMED WAVEFORMS
      switch (track.trackNumber) {
        case 1: {
          // ==================== Theme 1: 晨光吐司 (Morning Toast) ====================
          // Golden sunrise rays radiating outward from the vinyl edge
          const spokesCount = 64;
          ctx.save();
          ctx.strokeStyle = `${accentColor}55`;
          ctx.lineWidth = 1.2;

          for (let i = 0; i < spokesCount; i++) {
            const angle = (i / spokesCount) * Math.PI * 2 + time * 0.001;
            // Get frequency level or fallback wave
            const audioVal = hasRealAudio
              ? dataArray[i % dataArray.length]
              : Math.sin(time * 0.06 + i) * 12 + 18;
            
            const rStart = r_disc + 6;
            const rEnd = r_disc + 10 + (audioVal / 255) * 36;

            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * rStart, cy + Math.sin(angle) * rStart);
            ctx.lineTo(cx + Math.cos(angle) * rEnd, cy + Math.sin(angle) * rEnd);
            ctx.stroke();
          }

          // Subtle sun ring contour
          ctx.strokeStyle = `${accentColor}25`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r_disc + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 2: {
          // ==================== Theme 2: 校门告别 (School Gate Goodbye) ====================
          // Parent and child orbit paths with connecting thread lines representing touch
          const innerOrbit = r_disc + 6;
          const outerOrbit = r_disc + 26 + bass * 0.08;

          ctx.save();
          // Draw subtle thread connections
          ctx.strokeStyle = `${accentColor}12`;
          ctx.lineWidth = 0.5;
          const threadCount = 45;
          for (let i = 0; i < threadCount; i++) {
            const angleIn = (i / threadCount) * Math.PI * 2 + time * 0.004;
            const angleOut = (i / threadCount) * Math.PI * 2 - time * 0.005;

            const xi = cx + Math.cos(angleIn) * innerOrbit;
            const yi = cy + Math.sin(angleIn) * innerOrbit;
            const xo = cx + Math.cos(angleOut) * outerOrbit;
            const yo = cy + Math.sin(angleOut) * outerOrbit;

            ctx.beginPath();
            ctx.moveTo(xi, yi);
            ctx.lineTo(xo, yo);
            ctx.stroke();
          }

          // Delicate orbit ring borders
          ctx.strokeStyle = `${accentColor}25`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(cx, cy, innerOrbit, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `${accentColor}15`;
          ctx.beginPath();
          ctx.arc(cx, cy, outerOrbit, 0, Math.PI * 2);
          ctx.stroke();

          // Orbiting planet node representing child's exploration
          const orbitAngle = time * 0.005;
          const ox = cx + Math.cos(orbitAngle) * outerOrbit;
          const oy = cy + Math.sin(orbitAngle) * outerOrbit;

          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(ox, oy, 4 + mid * 0.08, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ox, oy, 7.5 + mid * 0.1, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 3: {
          // ==================== Theme 3: 格子间律动 (Office Cyber Beat) ====================
          // Sharp data-spikes visualizer and high-tech circular concentric tick rings
          const barsCount = 72;
          ctx.save();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;

          for (let i = 0; i < barsCount; i++) {
            const angle = (i / barsCount) * Math.PI * 2;
            const audioIdx = Math.floor((i / barsCount) * dataArray.length);
            const rawVal = dataArray[audioIdx] || (Math.sin(time * 0.08 + i) * 14 + 18);
            const barHeight = (rawVal / 255) * 36 + 2;

            const rStart = r_disc + 5;
            const rEnd = r_disc + 5 + barHeight;

            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * rStart, cy + Math.sin(angle) * rStart);
            ctx.lineTo(cx + Math.cos(angle) * rEnd, cy + Math.sin(angle) * rEnd);
            ctx.stroke();

            // Interactive cybersecurity ticks
            if (i % 6 === 0) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
              ctx.fillRect(cx + Math.cos(angle) * (rEnd + 4) - 1, cy + Math.sin(angle) * (rEnd + 4) - 1, 2, 2);
            }
          }

          // Dotted outer concentric framework
          ctx.strokeStyle = `${accentColor}30`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, r_disc + 40, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          break;
        }

        case 4: {
          // ==================== Theme 4: 夕阳重逢 (Sunset Warm House) ====================
          // Beautiful overlapping warm golden layered waves winding around the record
          ctx.save();
          const waves = [
            { color: `${accentColor}25`, freq: 6, speed: 0.015, amp: 8 + mid * 0.08, offset: 10 },
            { color: `${accentColor}65`, freq: 8, speed: -0.01, amp: 12 + bass * 0.12, offset: 18 },
            { color: "rgba(255, 255, 255, 0.4)", freq: 5, speed: 0.018, amp: 6 + treble * 0.06, offset: 24 },
          ];

          waves.forEach((w) => {
            ctx.strokeStyle = w.color;
            ctx.lineWidth = w.color === `${accentColor}65` ? 1.5 : 1;
            ctx.beginPath();

            const points = 100;
            for (let i = 0; i <= points; i++) {
              const theta = (i / points) * Math.PI * 2;
              const waveVal = Math.sin(theta * w.freq + time * w.speed) * w.amp;
              const radius = r_disc + w.offset + waveVal;

              const x = cx + Math.cos(theta) * radius;
              const y = cy + Math.sin(theta) * radius;

              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
          });
          ctx.restore();
          break;
        }

        case 5: {
          // ==================== Theme 5: 星空安眠 (Starry Lo-Fi Sleep) ====================
          // Star constellation dots orbiting record, with slow-breathing double sine helix
          ctx.save();

          // Twinkling stars orbiting vinyl perimeter
          starsRef.current.forEach((star) => {
            if (isPlaying) {
              star.angle += star.speed * 0.4;
            } else {
              star.angle += star.speed * 0.1;
            }

            const starRadius = r_disc + star.distance;
            const sx = cx + Math.cos(star.angle) * starRadius;
            const sy = cy + Math.sin(star.angle) * starRadius;

            const opacity = 0.25 + Math.sin(time * 0.04 + star.distance) * 0.15 + (treble / 255) * 0.35;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, Math.min(1, opacity))})`;
            ctx.beginPath();
            ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
            ctx.fill();
          });

          // Elegant breathing wave contour
          ctx.strokeStyle = `${accentColor}35`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const points = 90;
          for (let i = 0; i <= points; i++) {
            const theta = (i / points) * Math.PI * 2;
            const waveVal = Math.sin(theta * 6 + time * 0.006) * (6 + mid * 0.08);
            const r = r_disc + 12 + waveVal;
            const x = cx + Math.cos(theta) * r;
            const y = cy + Math.sin(theta) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
          break;
        }

        default:
          break;
      }

      animationFrameId = requestAnimationFrame(updateVisuals);
    };

    updateVisuals();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [track, isPlaying, analyser]);

  return (
    <div className="flex flex-col gap-6 w-full h-full justify-between">
      {/* Visual Turntable Player Card */}
      <div className="relative w-full aspect-square sm:aspect-auto sm:h-[410px] flex flex-col items-center justify-center rounded-3xl bg-white/70 border border-[#ede5db] p-5 overflow-hidden group shadow-sm">
        {/* Subtle Watermark indicator */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-0.5 select-none pointer-events-none bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#ede5db]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono tracking-wider text-emerald-600 uppercase font-bold">
              Live Ring Waves / 唱片外围实时互动波形
            </span>
          </div>
          <span className="text-[9px] font-sans text-[#857368]">
            {track.title} • 频率波形跟随声音脉动
          </span>
        </div>

        {/* Real-time Web Audio Radial Visualizer Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
        />

        <div className="flex flex-col items-center justify-center w-full h-full z-10">
          {/* Vinyl Disc Container with exact bounds for alignment */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Dynamic ambient color background glow behind vinyl disc */}
            <div
              ref={glowRef}
              className="absolute w-56 h-56 rounded-full filter blur-3xl opacity-20 transition-transform duration-75 pointer-events-none z-0"
              style={{
                backgroundColor: track.visualColor,
                transform: "scale(1)",
              }}
            />
            {/* Tone Arm of the Turntable (rides record and wobbles nicely on playing) */}
            <div
              ref={armRef}
              className="absolute top-[-10px] right-[25px] w-24 h-28 origin-top-right transition-transform duration-500 z-20 pointer-events-none"
              style={{
                transform: isPlaying ? "rotate(18deg)" : "rotate(0deg)",
              }}
            >
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
                <path
                  d="M90,10 L80,10 A10,10 0 0,0 70,20 L60,80 L40,105 L43,107 L63,82 L72,24 L90,24"
                  fill="none"
                  stroke="#c29d80"
                  strokeWidth="4"
                />
                <rect x="36" y="103" width="10" height="12" rx="2" fill="#8c6d53" />
                <circle cx="85" cy="17" r="10" fill="#4d3c30" />
              </svg>
            </div>

            {/* Vinyl Disc Scale Wrapper (Dynamic Beat Pulse) */}
            <div
              ref={discRef}
              className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center transition-transform duration-75 z-10"
            >
              {/* Vinyl Record */}
              <div
                className="w-full h-full rounded-full bg-[#281d19] flex items-center justify-center shadow-lg relative border-4 border-[#1f1512]/60 select-none"
                style={{
                  animation: isPlaying
                    ? `spin ${spinDuration}s linear infinite`
                    : "none",
                  boxShadow: isPlaying
                    ? `0 25px 50px -12px ${track.visualColor}40`
                    : "0 20px 25px -5px rgba(139, 115, 92, 0.2)",
                }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-2 rounded-full border border-black/20" />
                <div className="absolute inset-5 rounded-full border border-black/15" />
                <div className="absolute inset-9 rounded-full border border-black/10" />
                <div className="absolute inset-14 rounded-full border border-black/5" />

                {/* Center Album Cover Art Sticker */}
                <div className="w-[36%] h-[36%] rounded-full overflow-hidden relative border border-black flex items-center justify-center bg-[#4d3c30]">
                  <img
                    src={getSeedUrl()}
                    alt="Track art"
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Spindle hole */}
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-[#1f1512] border-2 border-[#3c2a22] z-10" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Track Title Display (Vinyl mode) */}
          <div className="text-center mt-4 z-10 select-none min-h-[52px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={track.trackNumber}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center gap-1.5 text-[#9e887a] font-mono text-[10px] tracking-widest uppercase">
                  <Music className="h-3 w-3" />
                  {track.musicStyle || "AI氛围电音"}
                </div>
                <h2 className="text-base sm:text-lg font-bold font-sans text-[#3c332e] tracking-wide mt-1 px-4">
                  {track.title}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Narrative & Subtitle Lyrics section (Display underneath the player) */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={track.trackNumber}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {/* Subtitle / Lyrics Display */}
            {track.lyrics && (
              <div className="rounded-3xl border border-[#ede5db] bg-white/70 p-4 shadow-sm relative overflow-hidden group">
                {/* Background Accent glow */}
                <div
                  className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full filter blur-3xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: track.visualColor }}
                />

                <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-wider text-[#9e887a] uppercase">
                  <Quote className="h-3.5 w-3.5 text-[#a39081]" style={{ color: track.visualColor }} />
                  <span>Lyrics Subtitles / 歌词字幕</span>
                </div>

                <p className="text-sm font-medium text-[#5c4a40] leading-relaxed font-sans italic pl-1 whitespace-pre-line">
                  {track.lyrics.split(" / ").map((line, idx) => (
                    <span
                      key={idx}
                      className="block text-center py-0.5 text-[#5c4a40] transition-colors duration-300 hover:text-[#3c332e]"
                      style={{
                        animationDelay: `${idx * 0.15}s`,
                        textShadow: isPlaying ? `0 0 10px ${track.visualColor}10` : "none",
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* Daily Chapter Story Description Card */}
            {track.story && (
              <div className="rounded-3xl border border-[#ede5db] bg-white/60 p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2.5 font-mono text-[10px] tracking-wider text-[#9e887a] uppercase">
                  <BookOpen className="h-3.5 w-3.5 text-[#a39081]" />
                  <span>Chapter Narrative / 剧情故事</span>
                </div>
                <p className="text-xs text-[#6e5d54] font-sans leading-relaxed text-justify">
                  {track.story}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
