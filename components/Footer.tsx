import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="wrap">
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link aria-label="EGONUX home" href="/" className={styles.logo}>
              <Image
                alt="EGONUX Wealth Central Hub"
                className={styles.brandLogo}
                height={784}
                sizes="190px"
                src="/brand/egonux-primary-logo.png"
                width={2007}
              />
            </Link>
            <p>
              The wealth central hub for the next generation of builders,
              learners, and earners.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <Link href="/os">EGONUX OS v3.0.1 MVP</Link>
            <Link href="#about">About</Link>
            <Link href="#academy">Academy</Link>
            <Link href="#services">Services</Link>
            <Link href="#resources">Resources</Link>
          </div>
          <div className={styles.footerCol}>
            <h4>Community</h4>
            <Link href="#community">WhatsApp Channel</Link>
            <Link href="#community">Instagram</Link>
            <Link href="#community">YouTube</Link>
          </div>
          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <p>info@egonux.com</p>
            <p>www.egonux.com</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 EGONUX. All rights reserved.</span>
          <span>Built by Egonu John William</span>
        </div>
      </div>
    </footer>
  );
}
