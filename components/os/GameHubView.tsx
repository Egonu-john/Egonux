import { useMemo, useState } from 'react';
import Icon from './Icon';
import styles from '@/styles/GameHub.module.css';

type Category = 'All games' | 'Strategy' | 'Arcade' | 'Learning' | 'Multiplayer';
type Game = { id: string; title: string; description: string; category: Exclude<Category, 'All games'>; xp: number; icon: string; tone: string; status: 'Available' | 'Coming soon' };

const games: Game[] = [
  { id: 'nexus-runner', title: 'NEXUS RUNNER', description: 'Race through the digital frontier and collect knowledge.', category: 'Arcade', xp: 120, icon: 'NR', tone: 'amber', status: 'Available' },
  { id: 'capital-quest', title: 'CAPITAL QUEST', description: 'Build financial knowledge through guided challenges.', category: 'Learning', xp: 180, icon: 'CQ', tone: 'green', status: 'Available' },
  { id: 'vault-defender', title: 'VAULT DEFENDER', description: 'Protect the vault in a tactical logic puzzle.', category: 'Strategy', xp: 240, icon: 'VD', tone: 'blue', status: 'Available' },
  { id: 'market-masters', title: 'MARKET MASTERS', description: 'Practice business decisions in a safe simulation.', category: 'Strategy', xp: 220, icon: 'MM', tone: 'violet', status: 'Available' },
  { id: 'legacy-builder', title: 'LEGACY BUILDER', description: 'Turn long-term goals into achievable milestones.', category: 'Learning', xp: 160, icon: 'LB', tone: 'rose', status: 'Available' },
  { id: 'creator-arena', title: 'CREATOR ARENA', description: 'Team up, solve challenges and create together.', category: 'Multiplayer', xp: 200, icon: 'CA', tone: 'cyan', status: 'Coming soon' },
];
const categories: Category[] = ['All games', 'Strategy', 'Arcade', 'Learning', 'Multiplayer'];
const missions = [
  { id: 'play', title: 'Play any game', detail: 'Open a sandbox game preview', xp: 50 },
  { id: 'learn', title: 'Learn something new', detail: 'Explore a learning challenge', xp: 75 },
  { id: 'checkin', title: 'Keep your streak alive', detail: 'Check in to the Game Hub today', xp: 25 },
];
const leaderboard = [
  { rank: '01', name: 'GoldBuilder', level: 18, xp: '8,420' },
  { rank: '02', name: 'NexusPilot', level: 16, xp: '7,960' },
  { rank: '03', name: 'LegacyMaker', level: 15, xp: '7,210' },
  { rank: '04', name: 'WealthExplorer', level: 12, xp: '5,880' },
];

export default function GameHubView({ onToast }: { onToast: (message: string) => void }) {
  const [category, setCategory] = useState<Category>('All games');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'Discover' | 'Missions' | 'Leaderboard'>('Discover');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [xp, setXp] = useState(2450);
  const filteredGames = useMemo(() => games.filter((game) => {
    const categoryMatch = category === 'All games' || game.category === category;
    const normalized = query.trim().toLowerCase();
    return categoryMatch && (!normalized || (game.title + ' ' + game.description + ' ' + game.category).toLowerCase().includes(normalized));
  }), [category, query]);
  const completeMission = (id: string, reward: number) => {
    if (completed.includes(id)) return;
    setCompleted((current) => [...current, id]);
    setXp((current) => current + reward);
    onToast('Sandbox mission completed: +' + reward + ' XP. No funds or cash rewards were issued.');
  };
  const launchGame = (game: Game) => {
    if (game.status !== 'Available') {
      onToast(game.title + ' is on the roadmap. No game session was started.');
      return;
    }
    setSelectedGame(game);
  };
  const missionXp = missions.filter((mission) => completed.includes(mission.id)).reduce((sum, mission) => sum + mission.xp, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><span className={styles.dot} /> EGONUX ECOSYSTEM <span className={styles.slash}>/</span> GAME HUB</div>
          <h1>Play with purpose<span>.</span></h1>
          <p>Explore skill-building games, complete missions and grow your sandbox XP.</p>
        </div>
        <div className={styles.sandboxTag}><span /> SANDBOX EXPERIENCE</div>
      </header>

      <section aria-label="Game Hub overview" className={styles.stats}>
        <article className={styles.stat}><span className={styles.statIcon}><Icon name="sparkles" size={18} /></span><small>YOUR EXPERIENCE POINTS</small><strong>{xp.toLocaleString()}</strong><p><b>+{missionXp} XP</b> from missions in this session</p></article>
        <article className={styles.stat}><span className={styles.statIcon}><Icon name="activity" size={18} /></span><small>DAILY STREAK</small><strong>05 <em>days</em></strong><p>Demo profile · illustrative streak</p></article>
        <article className={styles.stat}><span className={styles.statIcon}><Icon name="play" size={18} /></span><small>AVAILABLE GAMES</small><strong>05</strong><p>One more experience in development</p></article>
        <article className={styles.stat}><span className={styles.statIcon}><Icon name="shield" size={18} /></span><small>REWARD MODE</small><strong className={styles.sandboxValue}>Sandbox</strong><p>XP only · no cash value</p></article>
      </section>

      <nav aria-label="Game Hub sections" className={styles.tabs}>
        {(['Discover', 'Missions', 'Leaderboard'] as const).map((item) => <button aria-current={tab === item ? 'page' : undefined} className={tab === item ? styles.activeTab : ''} key={item} onClick={() => setTab(item)} type="button"><Icon name={item === 'Discover' ? 'compass' : item === 'Missions' ? 'target' : 'trophy'} size={17} />{item}{item === 'Missions' ? <span className={styles.count}>{completed.length}/3</span> : null}</button>)}
      </nav>

      {tab === 'Discover' ? <>
        <section className={styles.featured}>
          <div className={styles.featuredCopy}>
            <div className={styles.featuredKicker}><span className={styles.dot} /> FEATURED EXPERIENCE <span className={styles.pick}>EDITOR&apos;S PICK</span></div>
            <h2>NEXUS<br /><span>RUNNER</span></h2>
            <p>Move fast. Think ahead. Explore the EGONUX digital frontier through a short arcade-style preview.</p>
            <div className={styles.featureMeta}><span><Icon name="users" size={15} /> Solo experience</span><span><Icon name="zap" size={15} /> Quick play</span><span><Icon name="sparkles" size={15} /> 120 demo XP</span></div>
            <button className={styles.primaryButton} onClick={() => launchGame(games[0])} type="button"><Icon name="play" size={17} /> Open game preview <Icon name="arrow-up-right" size={16} /></button>
          </div>
          <div aria-hidden="true" className={styles.featuredArt}><div className={styles.orbit} /><div className={styles.ring} /><div className={styles.core}>N</div><span className={styles.artLabel}>NEXUS / 01</span></div>
          <span className={styles.featuredIndex}>01 <small>/ 06</small></span>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>CHOOSE YOUR NEXT MOVE</span><h2>Explore games</h2><p>Short experiences designed to build curiosity, strategy and skills.</p></div><label className={styles.search}><Icon name="search" size={18} /><span className={styles.srOnly}>Search games</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Search games..." type="search" value={query} /></label></div>
          <div aria-label="Filter games by category" className={styles.filters}>{categories.map((item) => <button aria-pressed={category === item} className={category === item ? styles.filterActive : ''} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div>
          {filteredGames.length ? <div className={styles.gameGrid}>{filteredGames.map((game) => <article className={styles.gameCard} key={game.id}>
            <div className={styles.gameArt + ' ' + styles[game.tone]}><span className={styles.gameMark}>{game.icon}</span><span className={styles.category}>{game.category}</span><span className={styles.gameOrbit} />{game.status === 'Available' ? <span className={styles.available}><i /> AVAILABLE</span> : <span className={styles.coming}>COMING SOON</span>}</div>
            <div className={styles.gameInfo}><div className={styles.gameTitleRow}><h3>{game.title}</h3><span className={styles.xpPill}>+{game.xp} XP</span></div><p>{game.description}</p><div className={styles.gameMeta}><span><Icon name="users" size={14} /> {game.category === 'Multiplayer' ? '2–4 players' : 'Solo experience'}</span><span><Icon name="gauge" size={14} /> {game.category}</span></div><button className={styles.cardButton} disabled={game.status !== 'Available'} onClick={() => launchGame(game)} type="button">{game.status === 'Available' ? 'View experience' : 'Coming soon'} <Icon name="arrow-up-right" size={15} /></button></div>
          </article>)}</div> : <div className={styles.empty}><Icon name="search" size={24} /><strong>No games found</strong><span>Try a different search or category.</span></div>}
        </section>
      </> : null}

      {tab === 'Missions' ? <section className={styles.section}>
        <div className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>SMALL STEPS. REAL SKILLS.</span><h2>Daily missions</h2><p>Complete optional sandbox activities to earn experience points in this session.</p></div><div className={styles.progress}><strong>{completed.length}/3</strong><span>missions completed</span><div><i style={{ width: ((completed.length / missions.length) * 100) + '%' }} /></div></div></div>
        <div className={styles.missions}>{missions.map((mission, index) => { const done = completed.includes(mission.id); return <article className={styles.mission} key={mission.id}><span className={styles.missionNumber}>{String(index + 1).padStart(2, '0')}</span><div className={styles.missionCopy}><h3>{mission.title}</h3><p>{mission.detail}</p></div><span className={styles.missionXp}>+{mission.xp} XP</span><button className={done ? styles.completedButton : styles.missionButton} disabled={done} onClick={() => completeMission(mission.id, mission.xp)} type="button">{done ? <><Icon name="check" size={16} /> Completed</> : 'Complete demo'}</button></article>; })}</div>
        <div className={styles.notice}><Icon name="shield" size={18} /><p><strong>Rewards are simulated.</strong> XP is held only in this page session. It is not money, a wallet balance, a redeemable benefit or a promise of financial reward.</p></div>
      </section> : null}

      {tab === 'Leaderboard' ? <section className={styles.section}>
        <div className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>COMMUNITY SPOTLIGHT</span><h2>Leaderboard</h2><p>Illustrative sandbox rankings to preview the community experience.</p></div><span className={styles.demoLabel}>DEMO DATA</span></div>
        <div className={styles.leaderboard}><div className={styles.leaderboardHead}><span>RANK</span><span>PLAYER</span><span>LEVEL</span><span>EXPERIENCE</span></div>{leaderboard.map((player) => <div className={styles.leaderboardRow} key={player.rank}><span className={player.rank === '01' ? styles.firstRank : styles.rank}>{player.rank}</span><span className={styles.playerName}><span className={styles.avatar}>{player.name.slice(0, 1)}</span><strong>{player.name}</strong></span><span className={styles.level}>LVL {player.level}</span><strong className={styles.leaderXp}>{player.xp} XP</strong></div>)}</div>
        <div className={styles.notice}><Icon name="info" size={18} /><p>These are sample profiles, not live rankings. A production leaderboard requires governed data, privacy controls and anti-abuse checks.</p></div>
      </section> : null}

      {selectedGame ? <div className={styles.backdrop} onClick={() => setSelectedGame(null)} role="presentation"><section aria-labelledby="preview-title" aria-modal="true" className={styles.modal} onClick={(event) => event.stopPropagation()} role="dialog"><button aria-label="Close game preview" className={styles.close} onClick={() => setSelectedGame(null)} type="button"><Icon name="close" size={20} /></button><div className={styles.modalArt + ' ' + styles[selectedGame.tone]}><span>{selectedGame.icon}</span></div><span className={styles.sectionEyebrow}>SANDBOX GAME PREVIEW</span><h2 id="preview-title">{selectedGame.title}</h2><p>{selectedGame.description}</p><div className={styles.previewFacts}><span>{selectedGame.category}</span><span>Solo experience</span><span>Up to {selectedGame.xp} demo XP</span></div><div className={styles.notice}><Icon name="shield" size={18} /><p>This preview does not connect to the wallet or move money. Live gameplay and rewards are not connected to a game engine yet.</p></div><button className={styles.primaryButton + ' ' + styles.fullButton} onClick={() => { setSelectedGame(null); onToast(selectedGame.title + ' preview opened. Live gameplay is not connected yet.'); }} type="button">Continue to preview <Icon name="arrow-up-right" size={16} /></button></section></div> : null}

      <footer className={styles.footer}><span>EGONUX GAME HUB</span><span>LEARN. BUILD. GROW. LEAD.</span><span>Preview environment · No cash rewards</span></footer>
    </div>
  );
}
