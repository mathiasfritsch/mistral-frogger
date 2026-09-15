# AGENTS.md - Frogger Game Project (PixiJS + Vite + TypeScript)

This file provides project-specific guidance for Mistral Vibe when working on the Frogger game.

> **⚠️ ALWAYS USE LATEST PIXIJS v8+ API** - See the [Deprecated vs Latest Methods](#pixijs-v8-api-deprecated-vs-latest-methods) section below.

---

## Project Overview

**Project:** Frogger game clone  
**Framework:** [PixiJS v8.8.1](https://pixijs.com/) - The HTML5 2D WebGL renderer  
**Bundler:** [Vite 6.2.0](https://vitejs.dev/)  
**Language:** TypeScript 5.7.3  
**Linting:** ESLint + Prettier  
**Working Directory:** `/frogger/` (all commands run from here)

---

## Project Structure

```
frogger/
├── public/
│   ├── assets/           # Static assets (images, sprites)
│   │   └── logo.svg     # Logo
│   ├── favicon.png
│   └── style.css        # Global styles
├── src/
│   ├── main.ts          # Entry point - PixiJS application (frog drawn via Graphics API)
│   └── vite-env.d.ts    # Vite TypeScript declarations
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── eslint.config.mjs    # ESLint configuration
```

---

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (port 8080, auto-opens browser)
npm run dev

# Or explicitly
npm start
```

### Building
```bash
# Lint, type-check, and build for production
npm run build

# Just lint
npm run lint
```

---

## PixiJS Quick Reference (v8+)

### Core Imports
```typescript
import { Application, Assets, Sprite, Container, Text, Graphics } from "pixi.js";
```

### Basic Application Setup
```typescript
const app = new Application();
await app.init({ 
  background: "#1099bb", 
  resizeTo: window,
  width: 800,
  height: 600
});
document.getElementById("pixi-container")!.appendChild(app.canvas);
```

### Loading Assets
```typescript
// Single asset
const texture = await Assets.load("/assets/sprite.png");

// Multiple assets
const textures = await Assets.load([
  "/assets/player.png",
  "/assets/enemy.png"
]);
```

### Creating Sprites
```typescript
const sprite = new Sprite(texture);
sprite.pivot.set(0.5, 0.5);  // Center pivot (v8: use pivot, not anchor)
sprite.position.set(x, y);
sprite.scale.set(0.5, 0.5);
app.stage.addChild(sprite);
```

### Drawing with Graphics (v8+ chaining API)
```typescript
const g = new Graphics()
  .rect(0, 0, 100, 50)
  .fill(0xFF0000)
  .circle(50, 25, 20)
  .fill(0x00FF00);
app.stage.addChild(g);
```

### Game Loop (Animation)
```typescript
app.ticker.add((delta) => {
  // delta = time since last frame (1.0 = 60fps)
  sprite.x += speed * delta;
});
```

### Key Concepts for Frogger
- **Application**: Main renderer instance
- **Assets**: Load textures, sounds, JSON
- **Sprite**: Display and animate images
- **Container**: Group multiple display objects
- **Graphics**: Draw shapes programmatically
- **Text**: Render text
- **Ticker**: Animation loop (requestAnimationFrame)

---

## PixiJS Documentation

- **[Official Guides](https://pixijs.com/8.x/guides)** - Step-by-step tutorials
- **[API Documentation](https://pixijs.download/v8.1.8/docs/index.html)** - Full class reference
- **[GitHub Repository](https://github.com/pixijs/pixijs)** - Examples and plugins
- **[Playground](https://pixijs.com/playground)** - Experiment without local setup

---

## Development Workflow

### When Adding New Features
1. Create a new TypeScript file in `src/` for game components
2. Add assets to `public/assets/`
3. Import and use in `main.ts` or your component
4. Test in browser: `npm run dev`

### When Modifying Game Logic
- Edit files in `src/`
- Use `app.ticker.add()` for frame updates
- Use `Assets.load()` for all asset loading

### File Naming Conventions
- TypeScript: `camelCase.ts` (e.g., `game.ts`, `player.ts`, `enemy.ts`)
- Assets: `lowercase-with-dashes.png` or `snake_case.png`

---

## Code Style

### TypeScript
- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and types
- Always use `const` unless variable needs reassignment
- Use type annotations for function parameters and returns

### PixiJS Specific
- Name sprite variables descriptively: `playerSprite`, `enemyCar`, `roadTile`
- Group related objects in Containers: `const roadContainer = new Container()`
- Clean up sprites: `app.stage.removeChild(sprite)` or `sprite.destroy()`

### ESLint Rules (from project config)
- Prettier integration for formatting
- Run `npm run lint` before committing

---

## Testing Strategy

This is a visual/desktop project. Testing approach:

1. **Manual Testing**: Run `npm run dev` and verify in browser
2. **Visual Regression**: Screenshot comparison for UI changes
3. **Unit Tests**: Use `vitest` (not yet configured - can be added)

---

## Git Guidelines

- Use feature branches: `git checkout -b feature/frogger-logic`
- Commit messages: Use imperative mood (e.g., "Add player collision detection")
- Do not commit to `main` directly
- Push only after local testing

---

## Common PixiJS Patterns for Frogger

### Moving a Sprite
```typescript
app.ticker.add((delta) => {
  const speed = 200; // pixels per second
  sprite.x += speed * delta;
});
```

### Collision Detection
```typescript
// Using getLocalBounds() (v8+ recommended)
function checkCollision(sprite1: Sprite, sprite2: Sprite): boolean {
  const bounds1 = sprite1.getLocalBounds();
  const bounds2 = sprite2.getLocalBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
}
```

### Screen Boundary Clamping
```typescript
// For a sprite with a given radius/half-width
const radius = 25; // Half of sprite width
sprite.x = Math.max(radius, Math.min(sprite.x, app.canvas.width - radius));
sprite.y = Math.max(radius, Math.min(sprite.y, app.canvas.height - radius));
```

### Keyboard Input (WASD + Arrow Keys)
```typescript
// Track keyboard state
const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// In game loop with frame-independent movement
app.ticker.add((delta) => {
  const speed = 200; // pixels per second
  let vx = 0;
  let vy = 0;

  // WASD + Arrow keys for steering
  if (keys["w"] || keys["ArrowUp"]) vy -= speed * delta;
  if (keys["s"] || keys["ArrowDown"]) vy += speed * delta;
  if (keys["a"] || keys["ArrowLeft"]) vx -= speed * delta;
  if (keys["d"] || keys["ArrowRight"]) vx += speed * delta;

  player.x += vx;
  player.y += vy;
});
```

---

## Tools & Permissions

### Allowed Tools
- All default tools are permitted
- Web search for PixiJS documentation
- File modifications in `frogger/` directory

### Denied Tools
- None specific to this project

---

## Troubleshooting

### Common Issues

**"Assets.load() returns undefined"**
- Check asset path is correct (from `/public/` folder)
- Verify file exists in `public/assets/`
- Use absolute paths starting with `/`

**"Sprite not visible"**
- Check if added to stage: `app.stage.addChild(sprite)`
- Verify texture loaded successfully
- Check if sprite is off-screen

**"TypeScript errors"**
- Run `npm install` to ensure types are available
- Check `tsconfig.json` for module resolution settings

---

## PixiJS v8 API: Deprecated vs Latest Methods

### ⚠️ AVOID (Deprecated in v8)

| Deprecated | Replacement |
|------------|-------------|
| `new PIXI.Application()` | `new Application()` + `await app.init()` |
| `PIXI.loader.add()` | `Assets.load()` or `Assets.loadBundle()` |
| `PIXI.Sprite.fromImage()` | `Assets.load()` + `new Sprite(texture)` |
| `PIXI.Texture.fromImage()` | `Assets.load()` |
| `graphics.beginFill().drawCircle().endFill()` | **Use chaining API** (see below) |
| `loader.onComplete.add()` | `Assets.load().then()` |
| `PIXI.ticker.shared.add()` | `app.ticker.add()` |
| `texture.baseTexture.scaleMode` | `texture.source.scaleMode` |

### ✅ USE (PixiJS v8+)

#### Application Setup
```typescript
// OLD (v7)
const app = new PIXI.Application({ width, height });

// NEW (v8+)
const app = new Application();
await app.init({ width, height, background: "#1099bb", resizeTo: window });
```

#### Loading Assets
```typescript
// OLD (v7)
PIXI.Assets.load("image.png").then((texture) => {...});

// NEW (v8+)
const texture = await Assets.load("/assets/image.png");
```

#### Graphics (Chaining API)
```typescript
// OLD (v7) - DEPRECATED
const g = new PIXI.Graphics();
g.beginFill(0xFF0000);
g.drawCircle(0, 0, 50);
g.endFill();

// NEW (v8+) - CHAINING API
const g = new Graphics()
  .circle(0, 0, 50)
  .fill(0xFF0000);
```

#### Sprites from Images
```typescript
// OLD (v7)
const sprite = PIXI.Sprite.fromImage("image.png");

// NEW (v8+)
const texture = await Assets.load("image.png");
const sprite = new Sprite(texture);
```

---

## Useful Links

- [PixiJS v8 Migration Guide](https://pixijs.com/8.x/guides/migration/v7-to-v8.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
