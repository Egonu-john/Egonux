# EGONUX OS v3.4.0 — Enterprise MVP

The interactive operating-system MVP for the EGONUX digital-wealth ecosystem. It brings together universal identity, a sandbox wallet, marketplace, learning, community, affiliate, AI, security, developer and founder-command experiences on one shared platform foundation.

> One Identity. One Wallet. One Marketplace. One Learning Platform. One Community. One Intelligence.

Open `/os` to launch the Enterprise MVP. The public website remains available at `/`.

Open `/anosa` to launch ANOSA Personal Mobile v1, the founder-only Read, Prepare, and Approve workspace. Execution remains locked.

Phase 3.1 adds a gated, keyless Firestore evidence ledger for permanent founder decisions and controlled-simulation receipts. See `docs/ANOSA_PHASE_3_1.md`; cloud activation requires a successful Founder canary and never enables external execution.

Open `/login` for the configuration-aware Firebase sign-up and sign-in experience.

## Release status

The package metadata currently identifies version **3.4.0**. The repository includes Next.js 16 / React 19, shared UI action components, security headers and metadata, a production-route smoke test, and CI/CodeQL workflows. Product data and external financial interactions remain sandboxed unless an individual integration is implemented, tested, approved and explicitly enabled.

## Features

- **Universal identity** — EGONUX ID, KYC journey, trust, devices and recovery
- **Sandbox wallet** — Multi-currency presentation, deposits, transfers, withdrawals, QR and savings vaults
- **Digital marketplace** — Listings, filters, vendor entrypoint and cart actions
- **EGONUX Learn** — Courses, progress, paths and credential concepts
- **Community and affiliate** — Groups, events, transparent single-tier pilot rewards and campaign assets
- **Permission-aware AI** — Demonstration assistant with consent context and safety disclosures
- **Founder Command Center** — Users, revenue, activity, fraud signals, AI insights and service health
- **Enterprise foundation** — Security center, API catalog, webhooks, SDKs and health endpoint
- **Responsive design** — Desktop workspace, tablet navigation and mobile command bar
- **ANOSA Personal Mobile** — Founder workspace with explicit Read, Prepare, Approve and Execute-locked boundaries
- **Quality gates** — GitHub Actions CI, CodeQL, button-system tests and production build checks

**Important:** This repository is not, by itself, proof that all 20 global architecture domains are production-ready. Demo balances and simulated interactions are not real funds or settlement. Real identity verification, provider integrations, tax filing, tokenization, staking/yield, and regulated financial services require individual technical, operational and legal approval.

## Project structure

- `app/`, `pages/` — Next.js routes and APIs
- `components/` — Shared UI and product experiences
- `lib/`, `types/` — Shared logic, data and types
- `apps/mobile/` — Flutter mobile application
- `docs/` — Architecture, security boundaries and release evidence
- `scripts/`, `tests/` — Smoke, domain and rules tests
- `.github/` — CI, CodeQL, ownership and dependency automation

## Getting started

### Prerequisites

- Node.js 24.x
- npm

### Installation

```bash
git clone https://github.com/Egonu-john/Egonux.git
cd Egonux
npm ci
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then use `/os` for EGONUX OS and `/anosa` for ANOSA.

### Build and checks

```bash
npm run lint
npm run typecheck
npm run test:buttons
npm run build
npm run test:smoke
```

Run Firestore rules tests with the required Firebase emulator prerequisites:

```bash
npm run test:rules
```

## Architecture and release governance

- [EGONUX OS v3 Global Architecture](docs/EGONUX_OS_V3_GLOBAL_ARCHITECTURE.md) — 20-domain target architecture, design system, security boundaries and delivery stages.
- [Global Release Checklist](docs/EGONUX_GLOBAL_RELEASE_CHECKLIST.md) — Evidence-based acceptance gates for the 23 November 2026 readiness review and 4 January 2027 release horizon.
- [Enterprise MVP architecture](docs/ENTERPRISE_MVP.md) — Existing platform architecture and phased implementation details.
- [ANOSA Phase 3.1](docs/ANOSA_PHASE_3_1.md) — Founder evidence ledger and controlled-simulation boundaries.

Copy the sanitized `.env.example` to `.env.local` for local development. Do not commit environment files or credentials. Removing a secret from the latest tree does not remove it from Git history; rotate any credential that was exposed.

## Security and maintenance

- Security headers and a restrictive baseline Content Security Policy are configured in the application.
- `/api/health` is a non-cached health contract and should not disclose secrets or personal data.
- CI and CodeQL run through GitHub Actions; inspect the exact commit's checks before release.
- Dependabot updates require review and compatibility checks.
- Report vulnerabilities privately through `SECURITY.md`.

## Brand and design

Use the official EGONUX brand assets and shared design tokens. The global edition's baseline uses obsidian `#0A0A0A`, royal gold `#D4AF37`, and institutional emerald `#10B981` for confirmed success states. User-facing interactive action labels follow the parenthetical convention, for example `( VIEW LEDGER )`.

## License

© 2026 EGONUX. All rights reserved.

Built by Egonu John William.
