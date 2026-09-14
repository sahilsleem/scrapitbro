import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export const DarkroomConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('photovault:ambient_particles') !== 'false';
    } catch {
      return true;
    }
  });

  // Listen for ambient particle toggle from Settings
  useEffect(() => {
    const handleParticlesChanged = (e: any) => {
      if (typeof e.detail === 'boolean') {
        setIsEnabled(e.detail);
      } else {
        try {
          setIsEnabled(localStorage.getItem('photovault:ambient_particles') !== 'false');
        } catch {}
      }
    };
    window.addEventListener('vault:particles-changed', handleParticlesChanged);
    return () => window.removeEventListener('vault:particles-changed', handleParticlesChanged);
  }, []);

  // Canvas particle constellation simulation
  useEffect(() => {
    if (!isEnabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = [
      'rgba(99, 102, 241, ',   // Indigo
      'rgba(139, 92, 246, ',   // Violet
    ];

    const particleCount = width < 480 ? 12 : 18;
    const maxDistance = width < 480 ? 60 : 80;

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: Math.random() * 1.0 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.15 + 0.05,
    }));

    let isVisible = true;
    let lastTime = performance.now();

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = (time: number) => {
      if (!isVisible) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * 60 * delta;
        p.y += p.vy * 60 * delta;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.06;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* 3 Prominently Visible Drifting Brand Blobs (Indigo & Violet, radial glow, smooth GPU translate loop) */}
      <div
        className="absolute top-[-8%] left-[-6%] w-[55vw] h-[55vw] max-w-[620px] max-h-[620px] rounded-full blur-2xl animate-drift-blob-1"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.38) 0%, rgba(129, 140, 248, 0.20) 45%, rgba(99, 102, 241, 0) 72%)',
          willChange: 'transform'
        }}
      />
      <div
        className="absolute top-[20%] right-[-8%] w-[58vw] h-[58vw] max-w-[680px] max-h-[680px] rounded-full blur-3xl animate-drift-blob-2"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(167, 139, 250, 0.18) 45%, rgba(139, 92, 246, 0) 72%)',
          willChange: 'transform'
        }}
      />
      <div
        className="absolute bottom-[-12%] left-[18%] w-[50vw] h-[50vw] max-w-[580px] max-h-[580px] rounded-full blur-2xl animate-drift-blob-3"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.32) 0%, rgba(99, 102, 241, 0.16) 45%, rgba(79, 70, 229, 0) 72%)',
          willChange: 'transform'
        }}
      />

      {/* Subtle Ambient Particle Canvas */}
      {isEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-40"
        />
      )}
    </div>
  );
};
