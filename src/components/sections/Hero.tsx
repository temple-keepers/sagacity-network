"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Easing: smooth ease-in-out
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Ring Phase durations (seconds)
    const INTRO_DURATION = 2.0;
    const SPIN_DURATION = 5.0;
    const OUTRO_DURATION = 2.0;
    const PAUSE_DURATION = 0.8;
    const CYCLE = INTRO_DURATION + SPIN_DURATION + OUTRO_DURATION + PAUSE_DURATION;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Neural Net Particles
    const PARTICLE_COUNT = 80;
    const CONNECT_DISTANCE = 150;
    const MOUSE_RADIUS = 200;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; baseOpacity: number }[] = [];
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        baseOpacity: Math.random() * 0.5 + 0.2,
      });
    }

    let mouse = { x: -1000, y: -1000 };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // --- 1. DRAW NEURAL NET BACKGROUND ---
      ctx.lineWidth = 0.6;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse repulse/attract
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - distMouse) / MOUSE_RADIUS;
          p.x -= (dxMouse / distMouse) * force * 1.5;
          p.y -= (dyMouse / distMouse) * force * 1.5;
        }

        // Draw connections
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DISTANCE) {
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.25;
            ctx.strokeStyle = `rgba(180, 140, 220, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Brighter node if near mouse
        let adjustedOpacity = p.baseOpacity;
        if (distMouse < MOUSE_RADIUS) {
          adjustedOpacity += (1 - distMouse / MOUSE_RADIUS) * 0.5;
        }
        
        ctx.fillStyle = `rgba(230, 210, 255, ${Math.min(1, adjustedOpacity)})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(180, 140, 220, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- 2. DRAW THE SPINNING CIRCLE PORTAL (Restored) ---
      const cx = w / 2;
      const cy = h / 2;
      const fullRadius = Math.min(w, h) * 0.34;

      const cycleTime = time % CYCLE;
      let ringAlpha = 0;
      let ringScale = 0;
      let spinProgress = 0;
      let mergeOffset = 0;

      if (cycleTime < INTRO_DURATION) {
        const t = cycleTime / INTRO_DURATION;
        const eased = easeInOut(t);
        ringScale = eased;
        ringAlpha = eased;
        spinProgress = 0;
        mergeOffset = (w * 0.25) * (1 - eased); // Slides in from 25% width
      } else if (cycleTime < INTRO_DURATION + SPIN_DURATION) {
        ringScale = 1;
        ringAlpha = 1;
        spinProgress = (cycleTime - INTRO_DURATION) / SPIN_DURATION;
        mergeOffset = 0;
      } else if (cycleTime < INTRO_DURATION + SPIN_DURATION + OUTRO_DURATION) {
        const t = (cycleTime - INTRO_DURATION - SPIN_DURATION) / OUTRO_DURATION;
        const eased = easeInOut(t);
        ringScale = 1 - eased; // Disappearing
        ringAlpha = 1 - eased;
        spinProgress = 1;
        mergeOffset = (w * 0.25) * eased; // Slides back out
      } else {
        ringScale = 0;
        ringAlpha = 0;
        mergeOffset = w * 0.25;
      }

      const radius = fullRadius * Math.max(0.2, ringScale); // Keep it slightly visible while sliding

      if (ringAlpha > 0.01) {
        ctx.globalAlpha = Math.min(1, ringAlpha * 1.5);

        ctx.strokeStyle = "rgba(123, 63, 160, 0.2)";
        ctx.lineWidth = 1.5;

        // Base ring: Left Half sliding in
        ctx.beginPath();
        ctx.arc(cx - mergeOffset, cy, radius, Math.PI / 2, Math.PI * 1.5, false);
        ctx.stroke();

        // Base ring: Right Half sliding in
        ctx.beginPath();
        ctx.arc(cx + mergeOffset, cy, radius, -Math.PI / 2, Math.PI / 2, false);
        ctx.stroke();

        // Glowing nodes at the tips of the merging halves
        if (mergeOffset > 0.1) {
          ctx.fillStyle = "rgba(220, 200, 255, 0.8)";
          ctx.beginPath(); ctx.arc(cx - mergeOffset, cy - radius, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx - mergeOffset, cy + radius, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + mergeOffset, cy - radius, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + mergeOffset, cy + radius, 3, 0, Math.PI*2); ctx.fill();
        }

        // Primary sweeping arc (Purple) - only visible fully once merged
        const arcLength = Math.PI * 0.7;
        const spinAngle = spinProgress * Math.PI * 4 - Math.PI / 2;
        let currentArcLength = arcLength;
        // Fade in the sweep length quickly after intro
        if (cycleTime < INTRO_DURATION) {
          currentArcLength = 0;
        } else if (cycleTime >= INTRO_DURATION + SPIN_DURATION && cycleTime < INTRO_DURATION + SPIN_DURATION + OUTRO_DURATION) {
           currentArcLength = 0;
        }

        if (currentArcLength > 0.01 && mergeOffset < 0.1) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, spinAngle, spinAngle + currentArcLength);
          ctx.strokeStyle = "rgba(180, 140, 220, 0.08)";
          ctx.lineWidth = 40 * ringScale;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, radius, spinAngle, spinAngle + currentArcLength);
          ctx.strokeStyle = "rgba(200, 170, 240, 0.18)";
          ctx.lineWidth = 12 * ringScale;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, radius, spinAngle, spinAngle + currentArcLength);
          ctx.strokeStyle = "rgba(230, 210, 255, 0.55)";
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.stroke();

          const headAngle = spinAngle + currentArcLength;
          const headX = cx + Math.cos(headAngle) * radius;
          const headY = cy + Math.sin(headAngle) * radius;

          const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 35 * ringScale);
          headGlow.addColorStop(0, "rgba(220, 200, 255, 0.7)");
          headGlow.addColorStop(0.3, "rgba(180, 140, 220, 0.25)");
          headGlow.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(headX, headY, 35 * ringScale, 0, Math.PI * 2);
          ctx.fillStyle = headGlow;
          ctx.fill();
        }

        // Secondary arc (Gold)
        const goldArcLength = Math.PI * 0.5;
        const goldAngle = -spinProgress * Math.PI * 3 + Math.PI;
        let currentGoldLength = goldArcLength;
        if (cycleTime < INTRO_DURATION || mergeOffset > 0.1) {
          currentGoldLength = 0;
        } else if (cycleTime >= INTRO_DURATION + SPIN_DURATION && cycleTime < INTRO_DURATION + SPIN_DURATION + OUTRO_DURATION) {
          currentGoldLength = 0;
        }

        if (currentGoldLength > 0.01 && mergeOffset < 0.1) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, goldAngle, goldAngle + currentGoldLength);
          ctx.strokeStyle = "rgba(201, 168, 76, 0.07)";
          ctx.lineWidth = 30 * ringScale;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, radius, goldAngle, goldAngle + currentGoldLength);
          ctx.strokeStyle = "rgba(201, 168, 76, 0.14)";
          ctx.lineWidth = 6 * ringScale;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, radius, goldAngle, goldAngle + currentGoldLength);
          ctx.strokeStyle = "rgba(220, 195, 110, 0.35)";
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.stroke();

          const gHeadAngle = goldAngle + currentGoldLength;
          const gHeadX = cx + Math.cos(gHeadAngle) * radius;
          const gHeadY = cy + Math.sin(gHeadAngle) * radius;

          const gGlow = ctx.createRadialGradient(gHeadX, gHeadY, 0, gHeadX, gHeadY, 25 * ringScale);
          gGlow.addColorStop(0, "rgba(220, 195, 110, 0.5)");
          gGlow.addColorStop(0.4, "rgba(201, 168, 76, 0.15)");
          gGlow.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(gHeadX, gHeadY, 25 * ringScale, 0, Math.PI * 2);
          ctx.fillStyle = gGlow;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      time += 0.016;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      style={{ background: "#05030A" }}
    >
      {/* 1. Deep Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #8050A0 1px, transparent 1px),
            linear-gradient(to bottom, #8050A0 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: "center center",
          perspective: "1000px"
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, transparent 30%, #05030A 100%)" }} />

      {/* 2. Ambient Pulsing Glows */}
      <motion.div 
        className="absolute top-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,63,160,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(60,180,220,0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
       <motion.div 
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,160,80,0.05) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* 3. Neural Net + Ring Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 1 }}
      />

      {/* 4. Comet Streaks */}
      <motion.div
        className="absolute top-[30%] -left-[10%] w-[200px] h-[1px] rotate-[35deg] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }}
        animate={{ x: ["-10vw", "110vw"], y: ["-10vh", "30vh"], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 6 }}
      />
      <motion.div
        className="absolute top-[60%] -left-[10%] w-[300px] h-[2px] rotate-[35deg] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(120,200,255,0.6), transparent)", filter: "blur(1px)" }}
        animate={{ x: ["-10vw", "120vw"], y: ["-10vh", "40vh"], opacity: [0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
      />

      {/* 5. Typography Content */}
      <div className="relative z-10 text-center max-w-[800px] section-px pointer-events-none">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-10"
        >
          <span
            className="inline-block text-[14px] md:text-[15px] font-[500] tracking-[0.1em] pb-2 uppercase"
            style={{
              color: "rgba(240, 236, 244, 0.8)",
              borderBottom: "1px solid var(--color-accent)",
            }}
          >
            Digital Product Studio
          </span>
        </motion.div>

        <div className="overflow-hidden mb-7">
          <motion.h1
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-[42px] md:text-[60px] lg:text-[72px] font-[800] leading-[1.1] tracking-[-0.03em]"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            Your Next Product, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DABAF5] via-[#A2E2F8] to-[#E8D4A2]">
              Perfected.
            </span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="text-[16px] md:text-[18px] font-[300] leading-[1.75] mb-12 max-w-[620px] mx-auto"
          style={{ color: "rgba(240, 236, 244, 0.6)" }}
        >
          Web apps, data systems, AI automation, and security &mdash;
          delivered by a team that&apos;s shipped five of their own platforms to production.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-5 mb-14 pointer-events-auto"
        >
          <Link
            href="/work"
            className="group relative px-8 py-3.5 text-[13px] font-[600] tracking-[0.06em] uppercase mx-auto md:mx-0 overflow-hidden"
            style={{ borderRadius: "40px", backgroundColor: "#FFFFFF", color: "#000000" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <span className="relative z-10">See our work</span>
          </Link>

          <Link
            href="/contact"
            className="px-8 py-3.5 text-[13px] font-[600] tracking-[0.06em] uppercase transition-all duration-300 hover:bg-white/10"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.9)",
              borderRadius: "40px",
              backdropFilter: "blur(10px)",
            }}
          >
            Start a project
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="flex items-center justify-center gap-6 flex-wrap pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)] animate-pulse" />
            <span className="text-[12px] font-[400] tracking-widest uppercase" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
              Data-Driven
            </span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255, 255, 255, 0.2)" }} />
          <span className="text-[12px] font-[400] tracking-widest uppercase" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
            UK Registered
          </span>
          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255, 255, 255, 0.2)" }} />
          <span className="text-[12px] font-[400] tracking-widest uppercase" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
            Enterprise-grade
          </span>
        </motion.div>
      </div>
    </section>
  );
}
