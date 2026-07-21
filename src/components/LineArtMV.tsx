import { useEffect, useRef } from "react";
import { Track } from "../types";

interface LineArtMVProps {
  track: Track;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
}

export default function LineArtMV({ track, isPlaying, analyser }: LineArtMVProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Handle high DPI displays for crisp line art
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial state for stars (Track 5)
    const stars: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 24; i++) {
      stars.push({
        x: Math.random() * 400,
        y: Math.random() * 320,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    // Grid animation state (Track 3)
    let gridOffset = 0;

    const render = () => {
      time += isPlaying ? track.tempoMultiplier : 0.4;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Fetch real audio data if available, otherwise simulate
      let dataArray = new Uint8Array(128);
      let hasRealAudio = false;
      if (analyser) {
        try {
          const bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);
          // Check if there is active audio signal
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          if (sum > 10) {
            hasRealAudio = true;
          }
        } catch (e) {
          hasRealAudio = false;
        }
      }

      // Calculate bass/mid/treble energy
      let bass = 0;
      let mid = 0;
      let treble = 0;

      if (hasRealAudio) {
        // Real frequency spectrum
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
        // Simulated ambient pulses (when paused or loading)
        const pulseFactor = isPlaying ? 1.0 : 0.3;
        bass = (Math.sin(time * 0.05) * 20 + 35) * pulseFactor;
        mid = (Math.cos(time * 0.08) * 15 + 25) * pulseFactor;
        treble = (Math.sin(time * 0.12) * 10 + 15) * pulseFactor;
      }

      // Clean background with a subtle dark tint
      ctx.fillStyle = "#09090b"; // zinc-950
      ctx.fillRect(0, 0, width, height);

      // Color palette from track metadata
      const accentColor = track.visualColor || "#f59e0b";

      // Draw specific thematic Line-Art MV based on track number
      switch (track.trackNumber) {
        case 1: {
          // ==================== MV 1: 晨光吐司 (Morning Toast) ====================
          // Golden morning sun rising with radiating responsive solar lines
          const centerX = width / 2;
          const centerY = height / 2 + 10;
          const sunRadius = 45 + bass * 0.2;

          ctx.save();
          // Draw ambient morning glow gradient
          const glowGrad = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.5, centerX, centerY, sunRadius * 2.5);
          glowGrad.addColorStop(0, `${accentColor}15`);
          glowGrad.addColorStop(1, "rgba(9, 9, 11, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, sunRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Draw rising landscape horizon hills (minimalist lines)
          ctx.strokeStyle = "rgba(63, 63, 70, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            const y1 = height - 50 + Math.sin(x * 0.008 + time * 0.01) * 10;
            if (x === 0) ctx.moveTo(x, y1);
            else ctx.lineTo(x, y1);
          }
          ctx.stroke();

          ctx.beginPath();
          ctx.strokeStyle = "rgba(82, 82, 91, 0.25)";
          for (let x = 0; x <= width; x += 10) {
            const y2 = height - 35 + Math.cos(x * 0.012 - time * 0.007) * 8;
            if (x === 0) ctx.moveTo(x, y2);
            else ctx.lineTo(x, y2);
          }
          ctx.stroke();

          // Draw radiating sunrise lines (Vector spokes)
          const spokesCount = 48;
          ctx.strokeStyle = `${accentColor}60`;
          ctx.lineWidth = 1;
          for (let i = 0; i < spokesCount; i++) {
            const angle = (i / spokesCount) * Math.PI * 2 + time * 0.002;
            const audioVal = dataArray[i % dataArray.length] || (Math.sin(time * 0.05 + i) * 15 + 20);
            const rStart = sunRadius + 5;
            const rEnd = sunRadius + 15 + (audioVal / 255) * 80;

            const xStart = centerX + Math.cos(angle) * rStart;
            const yStart = centerY + Math.sin(angle) * rStart;
            const xEnd = centerX + Math.cos(angle) * rEnd;
            const yEnd = centerY + Math.sin(angle) * rEnd;

            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
          }

          // Central Sun Outline
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner mini ring
          ctx.strokeStyle = `${accentColor}30`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, sunRadius - 12, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
          break;
        }

        case 2: {
          // ==================== MV 2: 校门告别 (School Gate Goodbye) ====================
          // Dual orbiting circles (representing parent & child) with connecting dynamic thread strings
          const centerX = width / 2;
          const centerY = height / 2;
          
          ctx.save();
          // Master ring paths
          const parentRadius = 80 + bass * 0.15;
          const childRadius = 45 + mid * 0.15;

          // Draw subtle connector threads between orbit rings
          ctx.strokeStyle = "rgba(63, 63, 70, 0.15)";
          ctx.lineWidth = 0.5;
          const threadCount = 36;
          for (let i = 0; i < threadCount; i++) {
            const angleP = (i / threadCount) * Math.PI * 2 + time * 0.005;
            const angleC = (i / threadCount) * Math.PI * 2 - time * 0.008;

            const xp = centerX + Math.cos(angleP) * parentRadius;
            const yp = centerY + Math.sin(angleP) * parentRadius;
            const xc = centerX + Math.cos(angleC) * childRadius;
            const yc = centerY + Math.sin(angleC) * childRadius;

            ctx.beginPath();
            ctx.moveTo(xp, yp);
            ctx.lineTo(xc, yc);
            ctx.stroke();
          }

          // Orbit circles
          ctx.strokeStyle = `${accentColor}30`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, parentRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `${accentColor}60`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, childRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Interactive heartbeat oscilloscope line in background
          ctx.strokeStyle = "rgba(113, 113, 122, 0.25)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x < width; x++) {
            // Heartbeat spike math
            const distFromCenter = Math.abs(x - centerX);
            let waveVal = Math.sin(x * 0.08 - time * 0.05) * 4;
            if (distFromCenter < 50) {
              const pulseIntensity = 1 - (distFromCenter / 50);
              waveVal += Math.sin(x * 0.4 - time * 0.15) * (15 + bass * 0.4) * pulseIntensity;
            }
            const y = centerY + waveVal;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Orbiting glowing planet nodes
          const parentAngle = time * 0.004;
          const childAngle = -time * 0.007;

          const px = centerX + Math.cos(parentAngle) * parentRadius;
          const py = centerY + Math.sin(parentAngle) * parentRadius;
          const cx = centerX + Math.cos(childAngle) * childRadius;
          const cy = centerY + Math.sin(childAngle) * childRadius;

          // Parents Node
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(px, py, 4 + treble * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, 8 + treble * 0.15, 0, Math.PI * 2);
          ctx.stroke();

          // Child Node
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5 + mid * 0.08, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          break;
        }

        case 3: {
          // ==================== MV 3: 格子间律动 (Office Beat) ====================
          // Elegant vector 3D grid and digital synthesizer vertical spikes
          ctx.save();
          
          gridOffset = (gridOffset + 1.2 + track.tempoMultiplier) % 40;
          const horizonY = height * 0.4;
          const gridYSpacing = 20;

          // 1. Draw 3D perspective lines radiating from horizon
          ctx.strokeStyle = "rgba(63, 63, 70, 0.3)";
          ctx.lineWidth = 1;
          const lineCount = 14;
          for (let i = 0; i <= lineCount; i++) {
            const xOffset = (i / lineCount) * width;
            const dx = (xOffset - width / 2) * 1.8; // stretch outwards

            ctx.beginPath();
            ctx.moveTo(width / 2 + dx * 0.05, horizonY);
            ctx.lineTo(width / 2 + dx, height);
            ctx.stroke();
          }

          // 2. Draw horizontal sliding lines (perspective grids)
          for (let y = horizonY; y < height; y += gridYSpacing) {
            const normalizedY = (y - horizonY) / (height - horizonY);
            const screenY = horizonY + Math.pow(normalizedY, 1.8) * (height - horizonY) + gridOffset * normalizedY;
            
            if (screenY < height) {
              const alpha = Math.min(1, normalizedY * 1.5);
              ctx.strokeStyle = `rgba(63, 63, 70, ${alpha * 0.35})`;
              ctx.beginPath();
              ctx.moveTo(0, screenY);
              ctx.lineTo(width, screenY);
              ctx.stroke();
            }
          }

          // 3. Render digital vector spectrum columns floating above horizon
          const columnCount = 20;
          const colWidth = 10;
          const colGap = 6;
          const totalColWidth = columnCount * (colWidth + colGap) - colGap;
          const colStartX = (width - totalColWidth) / 2;

          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.2;

          for (let i = 0; i < columnCount; i++) {
            const audioIdx = Math.floor((i / columnCount) * dataArray.length);
            const rawVal = dataArray[audioIdx] || (Math.sin(time * 0.1 + i) * 20 + 30);
            const colHeight = (rawVal / 255) * 85 + 4;

            const rx = colStartX + i * (colWidth + colGap);
            const ry = horizonY - 10;

            // Draw a minimalist wireframe bar
            ctx.fillStyle = "rgba(9, 9, 11, 0.8)";
            ctx.fillRect(rx, ry - colHeight, colWidth, colHeight);
            
            ctx.strokeStyle = i % 2 === 0 ? accentColor : `${accentColor}cc`;
            ctx.strokeRect(rx, ry - colHeight, colWidth, colHeight);

            // Draw a floating vector peak point above each bar
            const peakY = ry - colHeight - 4 - (Math.cos(time * 0.05 + i) * 3);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(rx + colWidth / 2 - 1.5, peakY, 3, 1.5);
          }

          // Horizon division line
          ctx.strokeStyle = "rgba(113, 113, 122, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, horizonY - 10);
          ctx.lineTo(width, horizonY - 10);
          ctx.stroke();

          ctx.restore();
          break;
        }

        case 4: {
          // ==================== MV 4: 夕阳重逢 (Sunset Reunion) ====================
          // Rolling terrain landscape line waves and a glowing sunset disk
          const centerX = width / 2;
          const centerY = height / 2 + 10;
          
          ctx.save();
          // Draw Sunset circular outline
          const sunsetRadius = 60 + mid * 0.15;
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY - 20, sunsetRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Subtle sun scanlines (synthesizer aesthetic)
          ctx.strokeStyle = "#09090b";
          ctx.lineWidth = 3;
          for (let sy = centerY - 20 - sunsetRadius; sy < centerY - 20 + sunsetRadius; sy += 10) {
            ctx.beginPath();
            ctx.moveTo(centerX - sunsetRadius - 10, sy);
            ctx.lineTo(centerX + sunsetRadius + 10, sy);
            ctx.stroke();
          }

          // Draw triple overlay waves (Terrain layers)
          const waves = [
            { color: "rgba(161, 161, 170, 0.2)", freq: 0.006, speed: 0.003, amp: 18 + bass * 0.2, base: height - 60 },
            { color: `${accentColor}40`, freq: 0.01, speed: -0.005, amp: 24 + mid * 0.15, base: height - 45 },
            { color: accentColor, freq: 0.015, speed: 0.007, amp: 14 + treble * 0.1, base: height - 30 },
          ];

          waves.forEach((w) => {
            ctx.strokeStyle = w.color;
            ctx.lineWidth = w.color === accentColor ? 1.5 : 1;
            ctx.beginPath();

            for (let x = 0; x <= width; x += 5) {
              const y = w.base + Math.sin(x * w.freq + time * w.speed) * w.amp;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          });

          ctx.restore();
          break;
        }

        case 5: {
          // ==================== MV 5: 星空安眠 (Starry Night) ====================
          // Floating starry dots connected with delicate constellation vector lines
          ctx.save();

          // 1. Render and update floating stars
          stars.forEach((star) => {
            // Stars float slowly
            if (isPlaying) {
              star.x += star.vx;
              star.y += star.vy;
            } else {
              star.x += star.vx * 0.2;
              star.y += star.vy * 0.2;
            }

            // Loop coordinates
            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;

            // Twinkle brightness modulated by treble
            const opacity = 0.3 + (treble / 255) * 0.6 + Math.sin(time * 0.05 + star.x) * 0.15;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, opacity))})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
          });

          // 2. Draw connections (minimalist constellation wires)
          ctx.strokeStyle = "rgba(63, 63, 70, 0.18)";
          ctx.lineWidth = 0.5;
          for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
              const dx = stars[i].x - stars[j].x;
              const dy = stars[i].y - stars[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 65) {
                ctx.beginPath();
                ctx.moveTo(stars[i].x, stars[i].y);
                ctx.lineTo(stars[j].x, stars[j].y);
                ctx.stroke();
              }
            }
          }

          // 3. Draw a breathing twin-helix smooth sine wave at the bottom
          const sineY = height - 55;
          ctx.strokeStyle = `${accentColor}70`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            const breathingFactor = 1.0 + Math.sin(time * 0.015) * 0.3; // Breathing inflation
            const amplitude = (12 + mid * 0.1) * breathingFactor;
            const y = sineY + Math.sin(x * 0.012 + time * 0.006) * amplitude;
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Anti-phase wave
          ctx.strokeStyle = `${accentColor}25`;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            const breathingFactor = 1.0 + Math.sin(time * 0.015) * 0.3;
            const amplitude = (10 + mid * 0.08) * breathingFactor;
            const y = sineY + Math.sin(x * 0.012 - time * 0.006 + Math.PI) * amplitude;
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          ctx.restore();
          break;
        }

        default:
          break;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [track, isPlaying, analyser]);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[340px] overflow-hidden rounded-3xl border border-zinc-900/60 select-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full absolute inset-0 object-cover opacity-90 block"
      />
      
      {/* Decorative Minimalist Retro Overlay frame */}
      <div className="absolute top-4 left-4 font-mono text-[9px] tracking-widest text-zinc-500/80 pointer-events-none uppercase">
        🎬 LINE MV • {track.title}
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[8px] tracking-widest text-zinc-600/60 pointer-events-none uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        LIVE RENDERING
      </div>
    </div>
  );
}
