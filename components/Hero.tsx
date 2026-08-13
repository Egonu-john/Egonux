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
          <span className="eyebrow">EGONUX OS v3.0 · Enterprise MVP</span>
          <h1 className={styles.heroHeading}>
            One Operating System for <em>Digital Wealth</em>
          </h1>
          <p className={styles.heroSub}>
            One identity. One wallet. One marketplace. One learning platform.
            One community. One intelligence layer — built to grow into a global
            digital-wealth ecosystem.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/os" className={styles.btnPrimary}>
              Launch Enterprise MVP
            </Link>
            <Link href="#about" className={styles.btnSecondary}>
              Explore the Vision
            </Link>
          </div>
          <div className={styles.heroVerticals}>
            <span>Identity</span>
            <span>Wallet</span>
            <span>Marketplace</span>
            <span>Learn</span>
            <span>Community</span>
            <span>AI</span>
          </div>
        </div>
      </div>
      <div className={styles.scrollCue}>
        <span className={styles.line}></span> Scroll
      </div>
    </section>
  );
}
