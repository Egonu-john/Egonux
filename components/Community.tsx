import Link from 'next/link';
import styles from '@/styles/Home.module.css';

const socialLinks = [
  'WhatsApp',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'X',
  'YouTube',
  'Telegram',
];

export default function Community() {
  return (
    <section id="community" className={styles.community}>
      <div className="wrap">
        <div className={styles.communityInner}>
          <div>
            <span className="eyebrow">Community</span>
            <h2 className={styles.communityHeading}>
              Wherever you already are, EGONUX is there too.
            </h2>
          </div>
          <div className={styles.socialLinks}>
            {socialLinks.map((social, idx) => (
              <Link key={idx} href="#" className={styles.socialLinks}>
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
