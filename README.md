# EGONUX OS v3.0 — Enterprise MVP

The first interactive operating-system MVP for the EGONUX digital-wealth ecosystem. It combines a universal identity, sandbox wallet, marketplace, learning, community, affiliate, AI, security, developer and founder-command experiences on one shared platform foundation.

> One Identity. One Wallet. One Marketplace. One Learning Platform. One Community. One Intelligence.

Open `/os` to launch the Enterprise MVP. The existing public website remains available at `/`.

## Features

- **Universal identity** — EGONUX ID, KYC journey, trust, devices and recovery
- **Sandbox wallet** — Multi-currency presentation, deposits, transfers, withdrawals, QR and savings vaults
- **Digital marketplace** — Verified listings, filters, vendor entrypoint and cart actions
- **EGONUX Learn** — Courses, progress, paths and credential concepts
- **Community and affiliate** — Groups, events, transparent single-tier pilot rewards and campaign assets
- **Permission-aware AI** — Demonstration assistant with consent context and safety disclosures
- **Founder Command Center** — Users, revenue, activity, fraud signals, AI insights and service health
- **Enterprise foundation** — Security center, API catalog, webhooks, SDKs and health endpoint
- **Responsive design** — Desktop workspace, tablet navigation and mobile command bar
- **Quality gate** — GitHub Actions runs lint, TypeScript and production build checks

This release intentionally uses demonstration data. It does not move, hold or exchange real money and does not process real identity documents.

## Project Structure

```
egonux/
├── components/          # Reusable React components
│   ├── os/              # EGONUX OS shell, modules and interactions
│   ├── Header.tsx       # Navigation
│   ├── Hero.tsx         # Hero section with canvas
│   ├── About.tsx        # About section
│   ├── Academy.tsx      # Academy tracks
│   ├── Services.tsx     # Services list
│   ├── Community.tsx    # Community section
│   ├── Resources.tsx    # Resources grid
│   └── Footer.tsx       # Footer
├── hooks/               # Custom React hooks
│   ├── useCanvasAnimation.ts  # Canvas animation logic
│   └── useScrollNav.ts        # Scroll navigation state
├── pages/               # Next.js pages
│   ├── _app.tsx         # App wrapper
│   ├── _document.tsx    # HTML document
│   ├── api/health.ts    # MVP health contract
│   ├── index.tsx        # Public website
│   └── os.tsx           # Enterprise MVP
├── lib/                 # Typed demonstration data
├── types/               # Shared product types
├── docs/                # Architecture and production boundaries
├── styles/              # CSS modules
│   ├── globals.css      # Global styles
│   └── Home.module.css  # Component styles
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/egonu-john/egonux.git
cd egonux

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

Open [http://localhost:3000/os](http://localhost:3000/os) to use EGONUX OS.

### Build

```bash
npm run build
npm start
npm run typecheck
# or
yarn build
yarn start
```

## Architecture and scope

Read [`docs/ENTERPRISE_MVP.md`](docs/ENTERPRISE_MVP.md) for the target Google Cloud architecture, production implementation phases, security and regulatory guardrails, and acceptance criteria.

Copy `.env.example` to `.env.local` only when connecting approved Firebase and Google Cloud environments. Never commit credentials.

## Customization

### Colors

Edit the CSS variables in `styles/globals.css`:

```css
:root {
  --obsidian: #0a0a0a;
  --gold: #d4af37;
  --champagne: #e9ce83;
  /* ... */
}
```

### Content

Update component content in their respective files:
- Academy tracks → `components/Academy.tsx`
- Services → `components/Services.tsx`
- Resources → `components/Resources.tsx`

### Canvas Animation

Adjust animation parameters in `hooks/useCanvasAnimation.ts`:
- `NODE_COUNT` — Number of animated nodes
- `MAX_DIST` — Connection distance threshold
- Node velocity and size

## Performance

- Canvas animation respects `prefers-reduced-motion`
- Optimized image delivery via Next.js Image component
- CSS modules for scoped styling
- Automatic code splitting

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## License

© 2026 EGONUX. All rights reserved.

## Built by

Egonu John William
