/**
 * Game Constants for Frogger
 * Based on frogger-game-rules.md specification
 */

// ============================================
// GRID CONFIGURATION
// ============================================

export const TILE_SIZE = 50; // pixels per tile
export const GRID_COLS = 13; // columns
export const GRID_ROWS = 15; // rows

// Calculate screen dimensions based on grid
export const SCREEN_WIDTH = GRID_COLS * TILE_SIZE;
export const SCREEN_HEIGHT = GRID_ROWS * TILE_SIZE;

// ============================================
// GAME CONFIGURATION
// ============================================

export const INITIAL_LIVES = 3;
export const FROG_TIME_LIMIT = 30; // seconds per frog
export const HOME_SLOTS = 5; // number of home slots at the top

// ============================================
// MOVEMENT CONFIGURATION
// ============================================

export const FROG_MOVE_DURATION = 100; // milliseconds for hop animation

// ============================================
// LANE CONFIGURATION
// Based on Appendix 12: Sample Lane Configuration (Default Level 0)
// ============================================

// Lane types
export type LaneType = "start" | "traffic" | "safe" | "water" | "goal";

// Direction types for moving entities
export type Direction = "left" | "right";

// Lane configuration for default level
export interface LaneConfig {
  type: LaneType;
  direction?: Direction; // for traffic and water lanes
  speed: number; // pixels per second
  entities: EntityConfig[];
}

export interface EntityConfig {
  type: string; // 'car', 'truck', 'log', 'turtle', 'alligator'
  count: number;
  spacing: number; // pixels between entities
  width: number; // in tiles
}

// Default lane configuration from frogger-game-rules.md Appendix 12
// From bottom to top:
// 1. Starting grass (row 14)
// 2. Traffic lanes (rows 10-13)
// 3. Safe grass median (row 9)
// 4. Water lanes (rows 5-8)
// 5. Goal row (row 0-4)

export const LANE_CONFIG: LaneConfig[] = [
  // Goal row - home slots (row 0-4 are goal area, but we'll simplify to row 0)
  {
    type: "goal",
    speed: 0,
    entities: [],
  },
  // Water lanes (4 lanes)
  {
    type: "water",
    direction: "right",
    speed: 100, // slow speed
    entities: [{ type: "log", count: 2, spacing: 200, width: 3 }],
  },
  {
    type: "water",
    direction: "left",
    speed: 150, // medium speed
    entities: [{ type: "turtle", count: 3, spacing: 150, width: 1 }],
  },
  {
    type: "water",
    direction: "right",
    speed: 175, // medium-fast speed
    entities: [
      { type: "log", count: 1, spacing: 300, width: 2 },
      { type: "turtle", count: 1, spacing: 200, width: 1 },
    ],
  },
  {
    type: "water",
    direction: "left",
    speed: 200, // fast speed
    entities: [{ type: "log", count: 2, spacing: 100, width: 2 }],
  },
  // Safe grass median (row 9)
  {
    type: "safe",
    speed: 0,
    entities: [],
  },
  // Traffic lanes (4 lanes)
  {
    type: "traffic",
    direction: "right",
    speed: 120, // slow speed
    entities: [{ type: "car", count: 2, spacing: 250, width: 1 }],
  },
  {
    type: "traffic",
    direction: "left",
    speed: 160, // medium speed
    entities: [{ type: "truck", count: 3, spacing: 200, width: 2 }],
  },
  {
    type: "traffic",
    direction: "right",
    speed: 180, // medium-fast speed
    entities: [{ type: "car", count: 2, spacing: 300, width: 1 }],
  },
  {
    type: "traffic",
    direction: "left",
    speed: 220, // fast speed
    entities: [{ type: "car", count: 3, spacing: 150, width: 1 }],
  },
  // Starting grass (row 14)
  {
    type: "start",
    speed: 0,
    entities: [],
  },
];

// ============================================
// SCORING CONFIGURATION
// ============================================

export const BASE_SCORE = 10; // points for reaching a home slot
export const ADJACENT_BONUS = 10; // bonus per adjacent empty slot
export const TIME_BONUS_FACTOR = 10; // remaining time * factor
export const FLY_BONUS = 100; // points for catching a fly
export const EXTRA_LIFE_THRESHOLD = 10000; // points for extra life

// ============================================
// LEVEL PROGRESSION
// ============================================

export const LEVELS = [
  { speedMultiplier: 1.0, densityMultiplier: 1.0 },
  { speedMultiplier: 1.1, densityMultiplier: 1.1 },
  { speedMultiplier: 1.2, densityMultiplier: 1.2 },
  { speedMultiplier: 1.3, densityMultiplier: 1.3 },
];

// ============================================
// GRID POSITION UTILITIES
// ============================================

/**
 * Convert grid coordinates to pixel coordinates
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
): { x: number; y: number } {
  return {
    x: gridX * TILE_SIZE,
    y: gridY * TILE_SIZE,
  };
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
): { x: number; y: number } {
  return {
    x: Math.floor(pixelX / TILE_SIZE),
    y: Math.floor(pixelY / TILE_SIZE),
  };
}

/**
 * Get the center pixel position of a grid cell
 */
export function gridToPixelCenter(
  gridX: number,
  gridY: number,
): { x: number; y: number } {
  return {
    x: gridX * TILE_SIZE + TILE_SIZE / 2,
    y: gridY * TILE_SIZE + TILE_SIZE / 2,
  };
}
