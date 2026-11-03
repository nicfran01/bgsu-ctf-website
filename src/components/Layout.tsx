import { useEffect, useRef, type MouseEvent } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './Layout.module.css';

export function Layout() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);

  // Scroll to the top when moving to another page. Section links (with a
  // hash) are handled by the page that owns the headings, and the first load
  // already starts at the top.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip} onClick={focusMain}>
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// With HashRouter, a plain "#main" link would change the route, so move focus by hand.
function focusMain(event: MouseEvent) {
  event.preventDefault();
  document.getElementById('main')?.focus();
}
