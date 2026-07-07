import styles from '@/styles/Home.module.css';

const services = [
  { title: 'AI Consulting', description: 'Practical AI integration for existing teams and workflows.' },
  { title: 'Business Consulting', description: 'Structure, strategy, and operations for early-stage ventures.' },
  { title: 'Digital Marketing', description: 'Positioning and growth for brands that need to be found.' },
  { title: 'Website Development', description: 'Fast, durable, well-engineered websites — not templates.' },
  { title: 'Mobile App Development', description: 'Native-quality apps for Android and iOS.' },
  { title: 'Branding', description: 'Identity systems built to hold up at any scale.' },
  { title: 'Investment Education', description: 'Structured guidance for people entering markets for the first time.' },
  { title: 'Wealth Coaching', description: 'One-on-one direction for people building toward a specific number.' },
];

export default function Services() {
  return (
    <>
      <hr className="hairline" />
      <section id="services" className={styles.section}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Services</span>
            <h2>What we build, for those who&apos;d rather delegate it.</h2>
          </div>
          <div className={styles.servicesList}>
            {services.map((service, idx) => (
              <div key={idx} className={styles.serviceRow}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className={styles.serviceArrow}>→</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
