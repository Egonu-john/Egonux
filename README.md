# EGONUX — Empowering the Next Generation of Digital Wealth

A modern, luxury-focused landing page for EGONUX, a comprehensive wealth education and digital entrepreneurship platform. Built with **Next.js**, **React**, and **TypeScript**.

## Features

- ✨ **Premium Design** — Sophisticated color palette (gold, charcoal, bone) with elegant typography
- 🎨 **Component-Based Architecture** — Reusable React components for maintainability
- 📱 **Fully Responsive** — Mobile-first design with optimized breakpoints
- ♿ **Accessible** — WCAG-compliant with focus management and reduced-motion support
- 🚀 **Performance** — Optimized canvas animation respecting user preferences
- 🎯 **SEO Ready** — Next.js optimizations with proper meta tags
- 🎭 **Interactive Elements** — Scroll-triggered navigation, hover effects, animated hero

## Project Structure

```
egonux/
├── components/          # Reusable React components
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
│   └── index.tsx        # Home page
├── styles/              # CSS modules
│   ├── globals.css      # Global styles
│   └── Home.module.css  # Component styles
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 16+
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

### Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

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
