import { useCanvasAnimation } from '@/hooks/useCanvasAnimation';
import { EgonuxActionLink } from '@/components/ui/EgonuxActionLink';
import styles from '@/styles/Home.module.css';

export default function Hero() {
  const canvasRef = useCanvasAnimation();

  return (
    <section className={styles.hero}>
      <canvas ref={canvasRef} className={styles.lattice} />
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <span className="eyebrow">EGONUX OS v3.0.1 · Enterprise MVP</span>
          <h1 className={styles.heroHeading}>
            One Operating System for <em>Digital Wealth</em>
          </h1>
          <p className={styles.heroSub}>
            One identity. One wallet. One marketplace. One learning platform.
            One community. One intelligence layer — built to grow into a global
            digital-wealth ecosystem.
          </p>
          <div className={styles.heroCtas}>
            <EgonuxActionLink href="/os" size="lg" labelStyle="parenthesized">LAUNCH ENTERPRISE MVP</EgonuxActionLink>
            <EgonuxActionLink href="#about" size="lg" variant="secondary" labelStyle="parenthesized">EXPLORE THE VISION</EgonuxActionLink>
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
