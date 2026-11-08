import { Link, NavLink } from 'react-router';
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
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="" width={40} height={40} className={styles.logo} />
          <span>{siteConfig.clubName}</span>
        </Link>
        <nav aria-label="Main">
          <ul className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
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
