import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scrolls to the element named in the route's hash, for example
 * #/challenges/foo#recon. Runs on load and whenever the hash changes.
 */
export function useHashScroll(ready: unknown) {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const go = () => {
      const el = document.getElementById(id);
      if (!el) return;
      // "instant" because a smooth scroll on page load gets cut short while
      // fonts and lazy-loaded code finish arriving.
      el.scrollIntoView({ behavior: 'instant' });
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    };
    go();
    // Web fonts and images can still change the page height on first load.
    if (document.readyState === 'complete') return;
    window.addEventListener('load', go, { once: true });
    return () => window.removeEventListener('load', go);
  }, [hash, pathname, ready]);
}
