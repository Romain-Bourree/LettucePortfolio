# Lettuce Portfolio

Personal portfolio site — a single-page experience built around an interactive work timeline, detail views, and motion-driven UI.

**Repository:** [github.com/Romain-Bourree/LettucePortfolio](https://github.com/Romain-Bourree/LettucePortfolio)

## Stack

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and production builds
- [Framer Motion](https://www.framer.com/motion/) and [GSAP](https://gsap.com/) for animation
- [Howler](https://howlerjs.com/) / [use-sound](https://github.com/joshwcomeau/use-sound) for audio

## Project layout

| Path | Role |
|------|------|
| `src/sections/` | Page sections (timeline, tagline, etc.) |
| `src/features/` | Data, types, and helpers per feature |
| `src/effects/` | Reusable visual effects and small components |
| `public/images/` | Project imagery served as static assets |
| `public/sounds/` | Audio assets |

## Scripts

```bash
npm install    # dependencies
npm run dev    # local dev — http://localhost:5173
npm run build  # typecheck + production bundle to dist/
npm run preview # serve the production build locally
npm run lint   # ESLint
```

## Deployment

Build output goes to `dist/`. Host that folder on any static host (e.g. [GitHub Pages](https://pages.github.com/), [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/)). If the app is not served from the site root, set the appropriate [`base`](https://vite.dev/config/shared-options.html#base) in `vite.config.ts`.

---

Built by [Romain Bourrée](https://github.com/Romain-Bourree).
