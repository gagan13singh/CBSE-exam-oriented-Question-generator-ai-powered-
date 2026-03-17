/**
 * src/components/Starfield.jsx
 * NEW FILE — drives the #starfield canvas from index.html
 * Returns null (no visible DOM element), just runs the animation
 */

import { useEffect } from 'react';

export default function Starfield() {
  useEffect(() => {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let shooting = [];
    let animId;
    let t = 0;

    // ── Resize canvas to fill the window ──
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildStars();
    }

    // ── Build star field ──
    function buildStars() {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 5500);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.1 + 0.2,
          base: Math.random() * 0.5 + 0.1,   // base opacity
          speed: Math.random() * 0.04 + 0.01,  // drift speed
          tw: Math.random() * 0.018 + 0.004, // twinkle speed
          offset: Math.random() * Math.PI * 2,  // twinkle phase
        });
      }
    }

    // ── Occasionally spawn a shooting star ──
    function maybeShooting() {
      if (shooting.length < 3 && Math.random() < 0.003) {
        shooting.push({
          x: Math.random() * canvas.width * 0.7,
          y: Math.random() * canvas.height * 0.35,
          dx: 4 + Math.random() * 5,
          dy: 1.5 + Math.random() * 3,
          len: 0,
          maxLen: 90 + Math.random() * 110,
          alpha: 1,
          growing: true,
        });
      }
    }

    // ── Main draw loop ──
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      // Regular stars
      stars.forEach(s => {
        const a = s.base + Math.sin(t * s.tw * 60 + s.offset) * 0.12;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${Math.max(0, Math.min(1, a))})`;
        ctx.fill();

        // Slow upward drift
        s.y -= s.speed;
        if (s.y < 0) {
          s.y = canvas.height;
          s.x = Math.random() * canvas.width;
        }
      });

      // Shooting stars
      maybeShooting();
      shooting = shooting.filter(s => s.alpha > 0.02);
      shooting.forEach(s => {
        if (s.growing) {
          s.len += s.dx * 0.7;
          if (s.len >= s.maxLen) s.growing = false;
        } else {
          s.alpha -= 0.035;
        }

        s.x += s.dx * 0.4;
        s.y += s.dy * 0.4;

        const ang = Math.atan2(s.dy, s.dx);
        const x0 = s.x - Math.cos(ang) * s.len;
        const y0 = s.y - Math.sin(ang) * s.len;

        const grad = ctx.createLinearGradient(x0, y0, s.x, s.y);
        grad.addColorStop(0, 'rgba(200,210,255,0)');
        grad.addColorStop(1, `rgba(200,210,255,${s.alpha * 0.75})`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    }

    // ── Start ──
    resize();
    window.addEventListener('resize', resize);
    draw();

    // ── Cleanup on unmount ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // No DOM output — canvas lives in index.html
  return null;
}