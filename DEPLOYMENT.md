# SledHEAD Deployment Guide

## Quick Start - Play the Game

### Option 1: Local Development
```bash
npm install
npm run dev
```
Open http://localhost:3000

### Option 2: Production Build
```bash
npm install
npm run build
npm run preview
```
Open http://localhost:4173

## Deploy to GitHub Pages

The repository includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the main branch.

### Setup GitHub Pages:

1. Go to your repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`
4. Save

### Manual Deploy:

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder now contains the production build
# Upload dist/ contents to your web host
```

## Deploy to Other Platforms

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel
1. Import your GitHub repository
2. Framework Preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

### Static Web Host
1. Build: `npm run build`
2. Upload everything in the `dist/` folder to your web server

## Environment Configuration

The game requires no environment variables or backend services. It's a pure client-side Phaser 3 game with:
- LocalStorage for save data
- Procedural generation (no external assets)
- No API calls

## Troubleshooting

### MIME Type Error
If you see "Failed to load module script" errors:
- Make sure you're serving the built files from `dist/`, not the source files
- The development server (`npm run dev`) handles TypeScript automatically
- Production deployments need to serve the compiled JavaScript from `dist/`

### Canvas Not Working
- Make sure your browser supports HTML5 Canvas
- Try a different browser (Chrome, Firefox, Safari, Edge all work)
- Check browser console for specific errors

### Performance Issues
- The game is optimized for modern browsers
- Disable browser extensions that might interfere
- Try a different device if performance is poor

## Building for Production

The production build:
- Compiles TypeScript to JavaScript
- Bundles all code with Vite
- Minifies and optimizes assets
- Generates source maps for debugging
- Splits Phaser into a separate chunk for better caching

Output:
- `dist/index.html` - Entry point
- `dist/assets/` - Bundled JavaScript and assets

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

(Basically any modern browser with ES2020 support)
