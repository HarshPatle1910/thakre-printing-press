import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * Robust scroll reveal hook:
 * 1. Observes existing [data-reveal] elements.
 * 2. Uses MutationObserver to auto-detect and observe dynamically loaded elements (e.g. services, forms).
 * 3. Includes a safety fallback so no element remains invisible if intersection calculation is delayed.
 */
export default function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If user prefers reduced motion, reveal everything immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('revealed'));
      return;
    }

    const threshold = options.threshold ?? 0.08;
    const rootMargin = options.rootMargin ?? '0px 0px -40px 0px';

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

    function observeElements(targetContainer) {
      if (!targetContainer) return;
      targetContainer.querySelectorAll('[data-reveal]:not(.revealed)').forEach((node) => {
        observer.observe(node);
      });
    }

    // Initial pass
    observeElements(el);

    // Watch for dynamically rendered child elements (e.g. services/forms from Firestore)
    const mutationObserver = new MutationObserver(() => {
      observeElements(el);
    });

    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
    });

    // Safety fallback: Ensure all content is revealed after 1.8s in case user doesn't scroll immediately
    const fallbackTimer = setTimeout(() => {
      if (el) {
        el.querySelectorAll('[data-reveal]:not(.revealed)').forEach((n) => {
          n.classList.add('revealed');
        });
      }
    }, 1800);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return containerRef;
}
