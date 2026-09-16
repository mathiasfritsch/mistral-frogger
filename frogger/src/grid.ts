import { GRID_COLS, GRID_ROWS, LANE, TILE_SIZE } from "./config";
import type { LaneType } from "./config";

/** Convert grid coordinates to pixel coordinates (top-left corner). */
export function gridToPixel(
  gridX: number,
  gridY: number,
): { x: number; y: number } {
  return { x: gridX * TILE_SIZE, y: gridY * TILE_SIZE };
}

/** Clamp grid coordinates to the play field bounds. */
export function clampToGrid(
  gridX: number,
  gridY: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(GRID_COLS - 1, gridX)),
    y: Math.max(0, Math.min(GRID_ROWS - 1, gridY)),
  };
}

/**
 * Row layout (row 0 = top of screen, row 14 = bottom):
 *   0        : goal row (home slots)
 *   1        : safe grass
 *   2 - 5    : water lanes (4)
 *   6        : safe grass median
 *   7 - 10   : traffic lanes (4)
 *   11 - 14  : starting grass
 */
export function getLaneType(row: number): LaneType {
  if (row === 0) return LANE.GOAL;
  if (row >= 2 && row <= 5) return LANE.WATER;
  if (row >= 7 && row <= 10) return LANE.TRAFFIC;
  if (row === 1 || row === 6) return LANE.SAFE;
  return LANE.START;
}

/** Columns of the five home slots (centered, every other column). */
export const HOME_SLOT_COLS = [2, 4, 6, 8, 10];

/** Colors used to render each lane type. */
export const LANE_COLORS: Record<LaneType, number> = {
  [LANE.START]: 0x2e8b57,
  [LANE.TRAFFIC]: 0x3a3a3a,
  [LANE.SAFE]: 0x3cb371,
  [LANE.WATER]: 0x1e90ff,
  [LANE.GOAL]: 0x6a5acd,
};
