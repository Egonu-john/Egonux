import styles from '@/styles/Home.module.css';

const resources = [
  { title: 'Business Templates', description: 'Ready-made frameworks for structuring a new venture.' },
  { title: 'Financial Planners', description: 'Spreadsheets for budgeting and forecasting.' },
  { title: 'Goal Trackers', description: 'Simple systems for tracking progress that compounds.' },
  { title: 'eBooks', description: 'Long-form guides on wealth, AI, and business.' },
];

export default function Resources() {
  return (
    <section id="resources" className={styles.section}>
      <div className="wrap">
        <div className={styles.sectionHead}>
          <span className="eyebrow">Resources</span>
          <h2>Free tools, no login required.</h2>
        </div>
        <div className={styles.resourcesGrid}>
          {resources.map((resource, idx) => (
            <div key={idx} className={styles.resourceCard}>
              <span className={styles.icon}>↓</span>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
