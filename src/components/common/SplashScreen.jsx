import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, FastForward, Sparkles } from 'lucide-react';
import splashVideo from '../../assets/animation_starting_splash.mp4';
import './SplashScreen.css';

/**
 * SplashScreen — Cinematic AI Video Intro for Thakre Printing Press.
 * Plays the starting animation video with progress tracking, sound toggle,
 * and a skip button.
 */
export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const completedRef = useRef(false);

  function finishSplash() {
    if (completedRef.current) return;
    completedRef.current = true;
    setExiting(true);
    setTimeout(() => {
      onDone?.();
    }, 600); // matches CSS exit transition
  }

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      finishSplash();
      return;
    }

    // Safety timeout — the video is 5.04s, so 6.2s is a safe maximum limit
    const safetyTimer = setTimeout(() => {
      finishSplash();
    }, 6200);

    return () => clearTimeout(safetyTimer);
  }, []);

  function handleTimeUpdate() {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress(Math.min(100, Math.round((current / total) * 100)));
    }
  }

  function toggleSound() {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  }

  return (
    <div
      className={`splash${exiting ? ' splash--exiting' : ''}`}
      aria-label="Welcome to Thakre Printing Press"
      role="dialog"
      aria-modal="true"
    >
      {/* Background ambient glow effect */}
      <div className="splash__ambient-backdrop" aria-hidden="true" />

      {/* Top action bar: Brand name & Skip button */}
      <header className="splash__header">
        <div className="splash__brand">
          <div className="splash__brand-icon">
            <Sparkles size={18} />
          </div>
          <div className="splash__brand-text">
            <span className="splash__brand-name">THAKRE PRINTING PRESS</span>
            <span className="splash__brand-tag">Goregaon • Gondia</span>
          </div>
        </div>

        <div className="splash__controls">
          <button
            type="button"
            className="splash__btn splash__btn--sound"
            onClick={toggleSound}
            title={isMuted ? 'Unmute video' : 'Mute video'}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            className="splash__btn splash__btn--skip"
            onClick={finishSplash}
            title="Skip intro"
            aria-label="Skip intro animation"
          >
            <span>Skip</span>
            <FastForward size={16} />
          </button>
        </div>
      </header>

      {/* Video Container Stage */}
      <main className="splash__stage">
        <div className="splash__video-wrapper">
          <video
            ref={videoRef}
            className="splash__video"
            src={splashVideo}
            autoPlay
            playsInline
            muted={isMuted}
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={finishSplash}
            onError={finishSplash}
          />
          {/* Subtle gradient vignette frame */}
          <div className="splash__video-overlay" aria-hidden="true" />
        </div>
      </main>

      {/* Bottom status & progress bar */}
      <footer className="splash__footer">
        <div className="splash__caption">
          <span className="splash__caption-dot" />
          <span>Starting Press Engine... High Quality Printing & Design</span>
        </div>
        <div className="splash__progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <div className="splash__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </footer>
    </div>
  );
}
