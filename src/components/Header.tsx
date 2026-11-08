import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import logo from '../assets/logo-128.png';
import { siteConfig } from '../site.config';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/tools', label: 'Tools' },
  { to: '/platforms', label: 'Platforms' },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About' },
];

export function Header() {
  // The menu button and the open state only matter below 48rem. Wider
  // screens hide the button and always show the links in a row.
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Close after moving to another page.
  useEffect(() => setOpen(false), [pathname]);

  // While open, Escape closes the menu and a tap outside the header closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="" width={40} height={40} className={styles.logo} />
          <span>{siteConfig.clubName}</span>
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
        <nav id="main-nav" aria-label="Main" className={open ? `${styles.navWrap} ${styles.open}` : styles.navWrap}>
          <ul className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  // Tapping the link for the current page does not change the
                  // path, so close here as well.
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
