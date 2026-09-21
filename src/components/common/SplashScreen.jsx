import { useState, useEffect } from 'react';
import './SplashScreen.css';

/**
 * SplashScreen — Cinematic loading animation for Thakre Printing Press.
 *
 * Shows a printing-press workflow (roller, paper feed, ink, printed lines,
 * stamp) for ~2.8 s, then fades out and calls onDone() to unmount itself.
 *
 * Usage in App.jsx:
 *   const [showSplash, setShowSplash] = useState(true);
 *   if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;
 */
export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Prefer reduced-motion → skip early
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const displayMs = prefersReduced ? 800 : 2900;
    const exitMs    = prefersReduced ? 300 : 650; // must match CSS transition

    const exitTimer = setTimeout(() => setExiting(true), displayMs);
    const doneTimer = setTimeout(() => onDone?.(), displayMs + exitMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`splash${exiting ? ' splash--exiting' : ''}`}
      aria-label="Loading Thakre Printing Press"
      aria-live="polite"
      role="status"
    >
      {/* Dot-grid background glow */}
      <div className="splash__bg" aria-hidden="true" />

      {/* Floating ink particles */}
      <div className="splash__particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="splash__particle" />
        ))}
      </div>

      {/* ── Printing press animation stage ── */}
      <div className="splash__stage" aria-hidden="true">
        {/* Ink roller that descends and presses the paper */}
        <div className="splash__roller" />

        {/* Paper feeding in from the bottom */}
        <div className="splash__paper">
          {/* Ink wash overlay after roller pass */}
          <div className="splash__ink" />

          {/* Printed text lines revealing left-to-right */}
          <div className="splash__lines">
            <div className="splash__line" />
            <div className="splash__line" />
            <div className="splash__line" />
            <div className="splash__line" />
          </div>

          {/* Check-mark stamp popping in bottom-right */}
          <div className="splash__stamp">
            {/* Checkmark SVG */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Brand identity ── */}
      <div className="splash__logo">
        <div className="splash__logo-icon">
          {/* Printer icon */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </div>
        <div className="splash__logo-text">
          <span className="splash__logo-name">Thakre Printing Press</span>
          <span className="splash__logo-tagline">Print · Design · Documents</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="splash__progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div className="splash__progress-bar" />
      </div>
    </div>
  );
}
