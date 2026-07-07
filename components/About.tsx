import styles from '@/styles/Home.module.css';

export default function About() {
  return (
    <section id="about" className={styles.section}>
      <div className="wrap">
        <div className={styles.sectionHead}>
          <span className="eyebrow">About EGONUX</span>
          <h2>
            Built on a simple premise: wealth is a skill, and it can be taught.
          </h2>
        </div>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutQuote}>
            <p>
              We didn't set out to build a website. We set out to build the
              infrastructure a person needs to go from learning to earning —
              without ever leaving the room.
            </p>
            <cite>— Egonu John William, Founder &amp; Chief Architect</cite>
          </div>
          <div className={styles.aboutList}>
            <div className={styles.aboutListItem}>
              <h3>Our Story</h3>
              <p>
                EGONUX began as a single builder's answer to a fragmented
                industry — one platform instead of five disconnected tools for
                learning, selling, earning, and saving.
              </p>
            </div>
            <div className={styles.aboutListItem}>
              <h3>Mission</h3>
              <p>
                To give every member the education, tools, and income streams to
                build durable digital wealth, under one account, one dashboard,
                one identity.
              </p>
            </div>
            <div className={styles.aboutListItem}>
              <h3>Vision</h3>
              <p>
                A self-sustaining wealth ecosystem where learning funds
                building, and building funds earning — at global scale.
              </p>
            </div>
            <div className={styles.aboutListItem}>
              <h3>Core Values</h3>
              <p>
                Ownership, discipline, transparency, and craft — in the product
                and in the people it's built for.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
