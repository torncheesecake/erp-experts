import { useEffect, useRef } from 'react';

/**
 * Hook to reveal elements when they enter the viewport
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - How much of element must be visible (0-1)
 * @param {string} options.rootMargin - Margin around viewport
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

/**
 * Hook to animate a number counting up
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (e.g., '%', '+')
 */
export function useCountUp(end, duration = 1500, suffix = '') {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            if (prefersReducedMotion) {
              element.textContent = end + suffix;
              return;
            }

            const start = 0;
            const startTime = performance.now();

            const animate = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Ease out cubic for smooth deceleration
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(start + (end - start) * easeOut);

              element.textContent = current + suffix;

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                element.textContent = end + suffix;
              }
            };

            requestAnimationFrame(animate);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration, suffix]);

  return ref;
}
