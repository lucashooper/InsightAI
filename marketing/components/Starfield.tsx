import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  driftX: number;
  driftY: number;
}

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create stars
    const stars: Star[] = [];
    const starCount = 150; // Adjust density here

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1, // 1-3px
        opacity: Math.random() * 0.7 + 0.3, // 0.3-1
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        driftX: (Math.random() - 0.5) * 0.1, // Slow drift
        driftY: (Math.random() - 0.5) * 0.1,
      });
    }

    // Animation
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016; // ~60fps

      stars.forEach((star) => {
        // Twinkling effect
        star.opacity += Math.sin(time * star.twinkleSpeed * 100) * 0.01;
        star.opacity = Math.max(0.2, Math.min(1, star.opacity));

        // Drift movement
        star.x += star.driftX;
        star.y += star.driftY;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Draw star with purple/white tint
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size
        );
        
        const color = Math.random() > 0.7 ? '#a78bfa' : '#ffffff'; // 30% purple, 70% white
        gradient.addColorStop(0, `${color}`);
        gradient.addColorStop(1, 'transparent');

        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Starfield;
