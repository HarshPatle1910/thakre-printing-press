import { useEffect, useRef } from 'react';
import './HeroCanvas.css';

// CMYK + brand accent palette (alpha prefix for rgba string building)
const STREAMS = [
  { r: 0,   g: 188, b: 212, name: 'cyan'      },  // Cyan
  { r: 220, g: 53,  b: 95,  name: 'magenta'   },  // Magenta
  { r: 255, g: 196, b: 0,   name: 'yellow'    },  // Yellow
  { r: 231, g: 111, b: 81,  name: 'accent'    },  // Terracotta brand accent
  { r: 200, g: 230, b: 201, name: 'light'     },  // Soft white-green shimmer
];

function randBetween(a, b) { return a + Math.random() * (b - a); }

export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip heavy animation if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;
    let particles = [];

    /* ── Resize ── */
    function setSize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    /* ── Particle class ── */
    class Particle {
      constructor(staggerLife = 0) {
        this.spawn(staggerLife);
      }

      spawn(preLife = 0) {
        const col = STREAMS[Math.floor(Math.random() * STREAMS.length)];
        this.r = col.r; this.g = col.g; this.b = col.b;

        // Start from random edge
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0: this.x = randBetween(0, W); this.y = 0; break;
          case 1: this.x = W; this.y = randBetween(0, H); break;
          case 2: this.x = randBetween(0, W); this.y = H; break;
          default: this.x = 0; this.y = randBetween(0, H);
        }

        // Target: near hero visual area (right ~40-60% of screen)
        const tx = W * randBetween(0.35, 0.65);
        const ty = H * randBetween(0.30, 0.70);
        const dist = Math.hypot(tx - this.x, ty - this.y) || 1;
        const speed = randBetween(0.4, 1.1);

        this.vx = ((tx - this.x) / dist) * speed;
        this.vy = ((ty - this.y) / dist) * speed;

        // Gentle swirl so paths curve naturally
        this.swirl = randBetween(-0.025, 0.025);

        this.size      = randBetween(1.0, 3.2);
        this.maxAlpha  = randBetween(0.12, 0.42);
        this.alpha     = 0;
        this.life      = preLife;
        this.maxLife   = Math.floor(randBetween(140, 320));
        this.trail     = [];
        this.trailLen  = Math.floor(randBetween(4, 14));
      }

      update() {
        this.life++;

        // Fade in first 40 frames, fade out last 40
        const fadeIn  = 40;
        const fadeOut = 40;
        if (this.life < fadeIn) {
          this.alpha = (this.life / fadeIn) * this.maxAlpha;
        } else if (this.life > this.maxLife - fadeOut) {
          this.alpha = ((this.maxLife - this.life) / fadeOut) * this.maxAlpha;
        } else {
          this.alpha = this.maxAlpha;
        }

        // Swirl: rotate velocity vector slightly each frame
        const angle = Math.atan2(this.vy, this.vx) + this.swirl;
        const spd   = Math.hypot(this.vx, this.vy);
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLen) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        if (this.life >= this.maxLife) this.spawn();
      }

      draw() {
        if (this.trail.length < 2 || this.alpha <= 0) return;

        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          const mx = (this.trail[i - 1].x + this.trail[i].x) / 2;
          const my = (this.trail[i - 1].y + this.trail[i].y) / 2;
          ctx.quadraticCurveTo(this.trail[i - 1].x, this.trail[i - 1].y, mx, my);
        }
        ctx.lineTo(this.x, this.y);

        ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
        ctx.lineWidth   = this.size;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.stroke();

        // Glowing orb at head
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2.5
        );
        grad.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.alpha * 1.6})`);
        grad.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    /* ── Init ── */
    function init() {
      setSize();
      const count = Math.min(90, Math.floor((W * H) / 7000));
      particles = [];
      for (let i = 0; i < count; i++) {
        // stagger so particles don't all appear at once
        particles.push(new Particle(Math.floor(Math.random() * 300)));
      }
    }

    /* ── Loop ── */
    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => { setSize(); });
    ro.observe(canvas);

    init();
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
    />
  );
}
