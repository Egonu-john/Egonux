import Link from 'next/link';
import { useCanvasAnimation } from '@/hooks/useCanvasAnimation';
import styles from '@/styles/Home.module.css';

export default function Hero() {
  const canvasRef = useCanvasAnimation();

  return (
    <section className={styles.hero}>
      <canvas ref={canvasRef} className={styles.lattice} />
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <span className="eyebrow">EGONUX Wealth Central Hub</span>
          <h1 className={styles.heroHeading}>
            Empowering the <em>Next Generation</em> of Digital Wealth
          </h1>
          <p className={styles.heroSub}>
            Learn. Build. Grow. Lead. One ecosystem for education, enterprise,
            and earning — built for people who intend to own their future, not
            rent it.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#community" className={styles.btnPrimary}>
              Join Community
            </Link>
            <Link href="#academy" className={styles.btnSecondary}>
              Explore Platform
            </Link>
          </div>
          <div className={styles.heroVerticals}>
            <span>Academy</span>
            <span>Marketplace</span>
            <span>Affiliate Network</span>
            <span>Watch &amp; Earn</span>
            <span>Wealth Wallet</span>
          </div>
        </div>
      </div>
      <div className={styles.scrollCue}>
        <span className={styles.line}></span> Scroll
      </div>
    </section>
  );
}
