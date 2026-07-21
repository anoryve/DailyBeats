import React, { useEffect, useState } from "react";

interface AmbientParticlesProps {
  color: string;
  isPlaying: boolean;
}

interface Particle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  speed: number; // seconds for anim
  delay: number; // seconds delay
}

export default function AmbientParticles({ color, isPlaying }: AmbientParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate unique randomized positions once to avoid continuous layout shifts
  useEffect(() => {
    const items: Particle[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 6, // 6px to 18px
      speed: Math.random() * 20 + 20, // 20s to 40s slow floats
      delay: Math.random() * -20, // negative delay so they start immediately spread out
    }));
    setParticles(items);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <svg className="w-full h-full opacity-30 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {particles.map((p) => {
          // Calculate an active multiplier for animations
          const animDuration = isPlaying ? p.speed * 0.6 : p.speed;
          return (
            <g key={p.id}>
              {/* Floating animated group with CSS transition on fill color */}
              <circle
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r={p.size}
                fill={color}
                filter="url(#soft-glow)"
                style={{
                  transition: "fill 2.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `ambient-float-${p.id % 4} ${animDuration}s infinite ease-in-out alternate`,
                  animationDelay: `${p.delay}s`,
                  opacity: isPlaying ? 0.45 : 0.25,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Styled keyframe injections for floating offsets */}
      <style>{`
        @keyframes ambient-float-0 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
          100% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes ambient-float-1 {
          0% { transform: translate(0px, 0px) scale(0.9); }
          50% { transform: translate(-40px, 30px) scale(1.15); }
          100% { transform: translate(25px, -20px) scale(1); }
        }
        @keyframes ambient-float-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, 25px) scale(0.85); }
          100% { transform: translate(-30px, -30px) scale(1.1); }
        }
        @keyframes ambient-float-3 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-20px, -35px) scale(0.9); }
          100% { transform: translate(35px, 25px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
