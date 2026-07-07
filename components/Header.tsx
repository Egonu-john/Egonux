import Link from 'next/link';
import { useScrollNav } from '@/hooks/useScrollNav';
import styles from '@/styles/Home.module.css';

export default function Header() {
  const isScrolled = useScrollNav();

  return (
    <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}>
      <Link href="#" className={styles.logo}>
        EGONU<span>X</span>
      </Link>
      <ul className={styles.navLinks}>
        <li>
          <Link href="#about">About</Link>
        </li>
        <li>
          <Link href="#academy">Academy</Link>
        </li>
        <li>
          <Link href="#services">Services</Link>
        </li>
        <li>
          <Link href="#community">Community</Link>
        </li>
        <li>
          <Link href="#resources">Resources</Link>
        </li>
        <li>
          <Link href="#contact">Contact</Link>
        </li>
      </ul>
      <Link href="#community" className={styles.navCta}>
        Join Community
      </Link>
    </nav>
  );
}
