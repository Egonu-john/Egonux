import styles from '@/styles/Home.module.css';

const tracks = [
  { title: 'Wealth Education', description: 'The principles behind money, markets, and long-term ownership.' },
  { title: 'AI Courses', description: 'Practical AI fluency for work, business, and building products.' },
  { title: 'Entrepreneurship', description: 'From idea to first customer — the unglamorous parts included.' },
  { title: 'Affiliate Marketing', description: 'Building and scaling an income stream you don\'t have to clock into.' },
  { title: 'E-commerce', description: 'Sourcing, storefronts, and the operations behind selling online.' },
  { title: 'Investing', description: 'Reading markets and instruments with a long-term lens.' },
  { title: 'Personal Finance', description: 'Budgeting, saving, and debt — the foundation before the growth.' },
  { title: 'Leadership', description: 'Managing people, projects, and yourself under pressure.' },
  { title: 'Digital Skills', description: 'The tools every modern builder is expected to already know.' },
];

export default function Academy() {
  return (
    <>
      <hr className="hairline" />
      <section id="academy" className={styles.section}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <span className="eyebrow">EGONUX Academy</span>
            <h2>A curriculum built for builders, not spectators.</h2>
            <p>
              Nine tracks, one dashboard. Progress, certificates, and quizzes
              designed to prove what you can actually do.
            </p>
          </div>
          <div className={styles.academyGrid}>
            {tracks.map((track, idx) => (
              <div key={idx} className={styles.academyCard}>
                <span className={styles.num}>Track</span>
                <h3>{track.title}</h3>
                <p>{track.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
