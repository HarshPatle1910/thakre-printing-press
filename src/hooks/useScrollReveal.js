import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * Adds "revealed" class to [data-reveal] children when they enter viewport.
 */
export default function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const el = containerRef.current;
      if (el) el.querySelectorAll('[data-reveal]').forEach(n => n.classList.add('revealed'));
      return;
    }

    const threshold  = options.threshold  ?? 0.12;
    const rootMargin = options.rootMargin ?? '0px 0px -60px 0px';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const el = containerRef.current;
    if (!el) return;
    el.querySelectorAll('[data-reveal]').forEach(n => observer.observe(n));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
