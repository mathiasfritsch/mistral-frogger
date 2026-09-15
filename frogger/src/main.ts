import { Application, Container, Graphics } from "pixi.js";

// ---------------------------------------------------------------
// Phase 1.2 — Game constants
// ---------------------------------------------------------------

/** Size of one grid tile in pixels. */
export const TILE_SIZE = 50;

/** Play field dimensions in tiles (columns x rows). */
export const GRID_COLS = 13;
export const GRID_ROWS = 15;

/** Frog speed in pixels per second. */
export const FROG_SPEED = 200;

/** Time limit (seconds) for each frog to reach a home slot. */
export const TIME_LIMIT = 30;

/** Named vehicle speed presets (px/s), from Appendix 12 of the rules. */
export const VEHICLE_SPEEDS = {
  slow: 60,
  medium: 100,
  "medium-fast": 140,
  fast: 180,
} as const;

/** Named platform (log/turtle) speed presets (px/s). */
export const PLATFORM_SPEEDS = {
  slow: 50,
  medium: 80,
  "medium-fast": 110,
  fast: 150,
} as const;

/** Default level-0 lane layout (traffic + water), from Appendix 12. */
export const LANE_CONFIG = {
  traffic: [
    { type: "car", count: 2, direction: 1, speed: VEHICLE_SPEEDS.slow },
    { type: "truck", count: 3, direction: -1, speed: VEHICLE_SPEEDS.medium },
    {
      type: "car",
      count: 2,
      direction: 1,
      speed: VEHICLE_SPEEDS["medium-fast"],
    },
    { type: "car", count: 3, direction: -1, speed: VEHICLE_SPEEDS.fast },
  ],
  water: [
    {
      direction: 1,
      speed: PLATFORM_SPEEDS.slow,
      platforms: [
        { type: "log", width: 3 },
        { type: "log", width: 3 },
      ],
    },
    {
      direction: -1,
      speed: PLATFORM_SPEEDS.medium,
      platforms: [
        { type: "turtle", width: 1 },
        { type: "turtle", width: 1 },
        { type: "turtle", width: 1 },
      ],
    },
    {
      direction: 1,
      speed: PLATFORM_SPEEDS["medium-fast"],
      platforms: [
        { type: "log", width: 2 },
        { type: "turtle", width: 1 },
      ],
    },
    {
      direction: -1,
      speed: PLATFORM_SPEEDS.fast,
      platforms: [
        { type: "log", width: 1 },
        { type: "log", width: 1 },
      ],
    },
  ],
};

// ---------------------------------------------------------------
// Phase 1.1 — Grid system
// ---------------------------------------------------------------

/**
 * Row layout (row 0 = top of screen, row 14 = bottom):
 *   0        : goal row (home slots)
 *   1        : safe grass
 *   2 - 5    : water lanes (4)
 *   6        : safe grass median
 *   7 - 10   : traffic lanes (4)
 *   11 - 14  : starting grass
 */
const LANE = {
  START: "start",
  TRAFFIC: "traffic",
  SAFE: "safe",
  WATER: "water",
  GOAL: "goal",
} as const;

type LaneType = (typeof LANE)[keyof typeof LANE];

function gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
  return { x: gridX * TILE_SIZE, y: gridY * TILE_SIZE };
}

function clampToGrid(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(GRID_COLS - 1, gridX)),
    y: Math.max(0, Math.min(GRID_ROWS - 1, gridY)),
  };
}

function getLaneType(row: number): LaneType {
  if (row === 0) return LANE.GOAL;
  if (row >= 2 && row <= 5) return LANE.WATER;
  if (row >= 7 && row <= 10) return LANE.TRAFFIC;
  if (row === 1 || row === 6) return LANE.SAFE;
  return LANE.START;
}

const LANE_COLORS: Record<LaneType, number> = {
  [LANE.START]: 0x2e8b57,
  [LANE.TRAFFIC]: 0x3a3a3a,
  [LANE.SAFE]: 0x3cb371,
  [LANE.WATER]: 0x1e90ff,
  [LANE.GOAL]: 0x6a5acd,
};

// ---------------------------------------------------------------
// Phase 1.3 — Input system (grid-based, one hop per keypress)
// ---------------------------------------------------------------

type Direction = "up" | "down" | "left" | "right";

const KEY_BINDINGS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

const DIRECTION_PRIORITY: Direction[] = ["up", "down", "left", "right"];

/**
 * Tracks keyboard input for grid-based movement. Movement is consumed once
 * per keypress: holding a key does not buffer repeated hops, and only one
 * direction is returned per frame (no diagonal movement).
 */
class KeyManager {
  private readonly pressed = new Set<Direction>();

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return; // Only a fresh keypress triggers a hop.
    const direction = KEY_BINDINGS[event.key];
    if (direction) this.pressed.add(direction);
  };

  /** Returns and clears a single pending direction, or null if none. */
  consumeDirection(): Direction | null {
    if (this.pressed.size === 0) return null;
    for (const direction of DIRECTION_PRIORITY) {
      if (this.pressed.has(direction)) {
        this.pressed.clear();
        return direction;
      }
    }
    return null;
  }
}

// ---------------------------------------------------------------
// Application
// ---------------------------------------------------------------

(async () => {
  const app = new Application();
  await app.init({
    background: "#000000",
    width: GRID_COLS * TILE_SIZE,
    height: GRID_ROWS * TILE_SIZE,
  });

  const container = document.querySelector<HTMLDivElement>("#pixi-container");
  container?.appendChild(app.canvas);

  // Render the tile grid, colored by lane type.
  const grid = new Container();
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const { x, y } = gridToPixel(col, row);
      const tile = new Graphics()
        .rect(x, y, TILE_SIZE, TILE_SIZE)
        .fill(LANE_COLORS[getLaneType(row)]);
      grid.addChild(tile);
    }
  }
  app.stage.addChild(grid);

  // Frog starts on the bottom grass row, centered horizontally.
  let gridX = Math.floor(GRID_COLS / 2);
  let gridY = GRID_ROWS - 1;

  const frog = new Graphics().circle(0, 0, TILE_SIZE / 2 - 4).fill(0x00ff00);
  app.stage.addChild(frog);

  const placeFrog = (): void => {
    const { x, y } = gridToPixel(gridX, gridY);
    frog.x = x + TILE_SIZE / 2;
    frog.y = y + TILE_SIZE / 2;
  };
  placeFrog();

  const keys = new KeyManager();

  // Grid-based hopping: one tile per fresh keypress, no diagonals.
  app.ticker.add(() => {
    const direction = keys.consumeDirection();
    if (!direction) return;

    switch (direction) {
      case "up":
        gridY -= 1;
        break;
      case "down":
        gridY += 1;
        break;
      case "left":
        gridX -= 1;
        break;
      case "right":
        gridX += 1;
        break;
    }

    const clamped = clampToGrid(gridX, gridY);
    gridX = clamped.x;
    gridY = clamped.y;

    placeFrog();
  });
})();
