import Image from 'next/image';
import Link from 'next/link';
import { useScrollNav } from '@/hooks/useScrollNav';
import styles from '@/styles/Home.module.css';

export default function Header() {
  const isScrolled = useScrollNav();

  return (
    <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}>
      <Link aria-label="EGONUX home" href="/" className={styles.logo}>
        <Image
          alt="EGONUX Wealth Central Hub"
          className={styles.brandLogo}
          height={784}
          priority
          sizes="(max-width: 600px) 132px, 154px"
          src="/brand/egonux-primary-logo.png"
          width={2007}
        />
      </Link>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/os">OS v3.0.1</Link>
        </li>
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
      <Link href="/os" className={styles.navCta}>
        Launch MVP
      </Link>
    </nav>
  );
}
