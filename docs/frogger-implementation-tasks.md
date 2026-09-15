# Frogger Implementation Tasks (PixiJS v8)

> **Based on:** [frogger-game-rules.md](./frogger-game-rules.md)
> **Target Framework:** PixiJS v8.8.1 + TypeScript + Vite
> **Project Directory:** `/frogger/`

---

## Implementation Status

- **Phase 1: Core Infrastructure** - ✅ COMPLETED
- **Phase 2: Game Entities** - ✅ COMPLETED
- **Phase 3: Lane & Level System** - ⏳ Pending
- **Phase 4: Collision & Game Logic** - ⏳ Pending
- **Phase 5: Scoring & Lives** - ⏳ Pending
- **Phase 6: Game States** - ⏳ Pending
- **Phase 7: Visuals & Polish** - ⏳ Pending
- **Phase 8: Advanced Features** - ⏳ Pending

---

## Overview

This document provides a **feasible, ordered task breakdown** for implementing Frogger based on the game rules specification. Tasks are organized into phases, from core infrastructure to advanced features.

**Current Status:** The `main.ts` file already includes a basic PixiJS v8 application with a frog sprite, keyboard input, and screen bounds. This serves as the foundation for Phase 1.

---

## Phase 1: Core Infrastructure

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 1.1 | Grid System | Implement tile-based grid (13 columns x 15 rows) with configurable tile size (e.g., 50px). Define lane types: `start`, `traffic`, `safe`, `water`, `goal`. | `src/grid.ts` |
| 1.2 | Game Constants | Define game constants: `TILE_SIZE`, `GRID_COLS`, `GRID_ROWS`, `LANE_CONFIG` (from Appendix 12 of game rules), `FROG_SPEED`, `VEHICLE_SPEEDS`, `TIME_LIMIT`. | `src/config.ts` |
| 1.3 | Input System | Refactor keyboard input to use **grid-based movement** (1 tile per keypress, no diagonal). Add `KeyManager` class to track key states and prevent repeated input buffering. | `src/input.ts` |

**Dependencies:** None (foundational)

---

## Phase 2: Game Entities

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 2.1 | Frog Class | Create `Frog` class with: position (grid coordinates), sprite (Graphics API), movement logic, collision bounds, state (`idle`, `moving`, `dead`, `safe`). | `src/entities/frog.ts` |
| 2.2 | Vehicle Class | Create `Vehicle` class with: texture/sprite, direction (left/right), speed, lane assignment, spawn/respawn logic. Support cars, trucks. | `src/entities/vehicle.ts` |
| 2.3 | Platform Class | Create `Platform` class (for water lanes): type (`log`, `turtle`, `alligator`), width (in tiles), direction, speed, submerge timer (for turtles). | `src/entities/platform.ts` |
| 2.4 | Home Slot Class | Create `HomeSlot` class: position, state (`empty`, `filled`, `fly`, `alligator_mouth`), sprite rendering. | `src/entities/homeSlot.ts` |

**Dependencies:** Phase 1

---

## Phase 3: Lane & Level System

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 3.1 | Lane Manager | Implement `LaneManager` to handle traffic/water lanes. Spawn vehicles/platforms at intervals, manage their movement, despawn off-screen. | `src/lanes.ts` |
| 3.2 | Lane Configuration | Parse `LANE_CONFIG` from `config.ts` to populate lanes. Traffic lanes: 4-5 lanes with alternating directions. Water lanes: 4-5 with platforms. | `src/lanes.ts` |
| 3.3 | Level System | Create `Level` class: load level data, track filled home slots, trigger level completion, apply difficulty scaling (speed++, density++). | `src/level.ts` |

**Dependencies:** Phase 2

---

## Phase 4: Collision & Game Logic

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 4.1 | Collision Detection | Implement `CollisionSystem` with `checkCollision(a: Entity, b: Entity)` using `getLocalBounds()`. Handle: vehicle to frog, water to frog (drowning), platform to frog (safe). | `src/collision.ts` |
| 4.2 | Water Logic | Add logic: frog dies if in water **and not on a platform**. If on a platform that moves off-screen -> frog dies. | `src/waterLogic.ts` |
| 4.3 | Death & Respawn | Handle frog death: play animation (optional), decrement lives, respawn at start position. If lives = 0 -> Game Over. | `src/game.ts` |
| 4.4 | Time Limit | Add per-frog timer (30s). Display visual countdown. If expires -> frog dies. | `src/timer.ts` |

**Dependencies:** Phase 3

---

## Phase 5: Scoring & Lives

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 5.1 | Scoring System | Implement `ScoreManager`: base 10 pts per home slot, +bonus for adjacent empty slots, +time bonus (remaining seconds x factor). | `src/score.ts` |
| 5.2 | Flies & Bonuses | Spawn flies in home slots (randomly). Award +100-200 pts if frog lands on fly. | `src/entities/fly.ts` |
| 5.3 | Extra Lives | Award extra life at score thresholds (e.g., every 10,000 pts). | `src/score.ts` |
| 5.4 | Lives UI | Display remaining lives (frog icons) at top-left. | `src/ui.ts` |

**Dependencies:** Phase 4

---

## Phase 6: Game States

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 6.1 | State Machine | Implement `GameStateManager` with states: `MENU`, `PLAYING`, `PAUSED`, `GAME_OVER`, `LEVEL_COMPLETE`. | `src/states.ts` |
| 6.2 | Menu Screen | Create start menu with "Play", "High Scores", "Options". | `src/screens/menu.ts` |
| 6.3 | Game Over Screen | Display score, "Retry", "Main Menu" buttons. | `src/screens/gameOver.ts` |
| 6.4 | Pause Functionality | Add pause toggle (ESC key), freeze game loop, show overlay. | `src/screens/pause.ts` |

**Dependencies:** Phase 5

---

## Phase 7: Visuals & Polish

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 7.1 | Asset Loading | Add sprites for vehicles, platforms, flies, alligators. Use `Assets.load()` for textures. Fallback to Graphics API for prototyping. | `src/assets.ts` |
| 7.2 | Animations | Add hop animation for frog movement (e.g., scale bounce). Submerge animation for turtles. | `src/animations.ts` |
| 7.3 | UI Elements | Score counter (top-center), timer (top-right), level indicator. | `src/ui.ts` |
| 7.4 | Sound Effects | Optional: Add collision, jump, level complete sounds via `Assets.load()` + Howler.js. | `src/audio.ts` |

**Dependencies:** Phase 6

---

## Phase 8: Advanced Features (Optional)

| # | Task | Description | Output File |
|---|------|-------------|-------------|
| 8.1 | Endless Mode | After last level, continue with auto-generated difficulty scaling. | `src/modes.ts` |
| 8.2 | Alligator Mouths | Randomly place open alligator mouths in home slots. Entering -> death or bonus (configurable). | `src/entities/alligator.ts` |
| 8.3 | Lady Frog Bonus | If 2 frogs reach adjacent home slots -> +1000 pts "escort bonus". | `src/score.ts` |
| 8.4 | Touch Controls | Add touch support for mobile: virtual D-pad + tap to move. | `src/input.ts` |

**Dependencies:** Phase 7

---

## Recommended Implementation Order

```
Phase 1: Core Infrastructure (1.1-1.3)
    |
Phase 2: Game Entities (2.1-2.4)
    |
Phase 3: Lane & Level System (3.1-3.3)
    |
Phase 4: Collision & Game Logic (4.1-4.4)
    |
Phase 5: Scoring & Lives (5.1-5.4)
    |
Phase 6: Game States (6.1-6.4)
    |
Phase 7: Visuals & Polish (7.1-7.4)
    |
Phase 8: Advanced Features (8.1-8.4) [Optional]
```

---

## PixiJS v8 Technical Notes

When implementing these tasks, adhere to the following PixiJS v8+ patterns:

### Application Setup
```typescript
const app = new Application();
await app.init({ background: "#1099bb", resizeTo: window, width: 800, height: 600 });
document.getElementById("pixi-container")!.appendChild(app.canvas);
```

### Graphics API (Chaining)
```typescript
// Use chaining API (v8+)
const frog = new Graphics()
  .circle(0, 0, 25)
  .fill(0x00FF00)
  .circle(-10, -8, 5)
  .fill(0xFFFFFF);
```

### Asset Loading
```typescript
// Load single or multiple assets
const texture = await Assets.load("/assets/car.png");
const sprite = new Sprite(texture);
```

### Collision Detection
```typescript
// Use getLocalBounds() (v8 recommended)
function checkCollision(sprite1: Sprite, sprite2: Sprite): boolean {
  const bounds1 = sprite1.getLocalBounds();
  const bounds2 = sprite2.getLocalBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
}
```

### Game Loop
```typescript
app.ticker.add((delta) => {
  // delta = time since last frame (1.0 = 60fps)
  // Use delta for frame-independent movement
  sprite.x += speed * delta;
});
```

### Grid to Pixel Conversion
```typescript
const TILE_SIZE = 50;
const pixelX = gridX * TILE_SIZE;
const pixelY = gridY * TILE_SIZE;
```

---

## Current Project Status

The existing `src/main.ts` provides a starting point with:
- PixiJS v8 application initialization
- Frog sprite created with Graphics chaining API
- Keyboard input (WASD + arrow keys)
- Screen boundary clamping

**Next Immediate Task:** Replace free-roaming movement with grid-based hopping (Tasks 1.3 and 2.1).

---

## File Structure Reference

```
frogger/
├── src/
│   ├── config.ts          # Game constants (1.2)
│   ├── grid.ts            # Grid system (1.1)
│   ├── input.ts           # Input system (1.3)
│   ├── entities/
│   │   ├── frog.ts        # Frog class (2.1)
│   │   ├── vehicle.ts     # Vehicle class (2.2)
│   │   ├── platform.ts    # Platform class (2.3)
│   │   ├── homeSlot.ts    # Home slot class (2.4)
│   │   └── fly.ts         # Fly bonus (5.2)
│   ├── lanes.ts           # Lane manager (3.1-3.2)
│   ├── level.ts           # Level system (3.3)
│   ├── collision.ts       # Collision system (4.1)
│   ├── waterLogic.ts      # Water logic (4.2)
│   ├── game.ts            # Game logic (4.3)
│   ├── timer.ts           # Time limit (4.4)
│   ├── score.ts           # Scoring (5.1, 5.3)
│   ├── states.ts          # State machine (6.1)
│   ├── screens/
│   │   ├── menu.ts        # Menu screen (6.2)
│   │   ├── gameOver.ts    # Game over screen (6.3)
│   │   └── pause.ts       # Pause screen (6.4)
│   ├── ui.ts              # UI elements (5.4, 7.3)
│   ├── assets.ts          # Asset loading (7.1)
│   ├── animations.ts      # Animations (7.2)
│   ├── audio.ts           # Sound effects (7.4)
│   └── main.ts            # Entry point
├── public/
│   └── assets/            # Static assets (images, sprites)
└── docs/
    ├── frogger-game-rules.md      # Game rules
    └── frogger-implementation-tasks.md  # This file
```
