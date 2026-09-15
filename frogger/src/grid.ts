/**
 * Grid System for Frogger
 * Tile-based grid with lane management
 */

import {
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  LANE_CONFIG,
  LaneType,
  gridToPixel,
  gridToPixelCenter,
} from "./config";

// ============================================
// GRID POSITION TYPE
// ============================================

/**
 * Represents a position on the grid in tile coordinates
 */
export interface GridPosition {
  x: number; // column (0 to GRID_COLS-1)
  y: number; // row (0 to GRID_ROWS-1)
}

/**
 * Represents a position in pixel coordinates
 */
export interface PixelPosition {
  x: number;
  y: number;
}

// ============================================
// GRID CLASS
// ============================================

/**
 * Manages the game grid and lane information
 */
export class Grid {
  private lanes: LaneType[];

  constructor() {
    // Initialize lanes from config
    // LANE_CONFIG is ordered from top (goal) to bottom (start)
    // We'll store it as-is for easy lookup
    this.lanes = LANE_CONFIG.map((lane) => lane.type);
  }

  /**
   * Get the lane type at a given grid row
   * @param row - The grid row (0 = top, GRID_ROWS-1 = bottom)
   * @returns The lane type at that row
   */
  getLaneType(row: number): LaneType {
    // Ensure row is within bounds
    const clampedRow = Math.max(0, Math.min(row, GRID_ROWS - 1));
    return this.lanes[clampedRow];
  }

  /**
   * Check if a grid position is within bounds
   * @param position - The grid position to check
   * @returns True if within bounds
   */
  isWithinBounds(position: GridPosition): boolean {
    return (
      position.x >= 0 &&
      position.x < GRID_COLS &&
      position.y >= 0 &&
      position.y < GRID_ROWS
    );
  }

  /**
   * Check if a grid position is in a traffic lane
   */
  isTrafficLane(position: GridPosition): boolean {
    if (!this.isWithinBounds(position)) return false;
    return this.getLaneType(position.y) === "traffic";
  }

  /**
   * Check if a grid position is in a water lane
   */
  isWaterLane(position: GridPosition): boolean {
    if (!this.isWithinBounds(position)) return false;
    return this.getLaneType(position.y) === "water";
  }

  /**
   * Check if a grid position is in a safe lane (grass median)
   */
  isSafeLane(position: GridPosition): boolean {
    if (!this.isWithinBounds(position)) return false;
    return this.getLaneType(position.y) === "safe";
  }

  /**
   * Check if a grid position is in the start lane
   */
  isStartLane(position: GridPosition): boolean {
    if (!this.isWithinBounds(position)) return false;
    return this.getLaneType(position.y) === "start";
  }

  /**
   * Check if a grid position is in the goal lane
   */
  isGoalLane(position: GridPosition): boolean {
    if (!this.isWithinBounds(position)) return false;
    return this.getLaneType(position.y) === "goal";
  }

  /**
   * Check if a grid position is hazardous (traffic or water without platform)
   * Note: This doesn't check for platforms - that's handled by collision system
   */
  isHazardous(position: GridPosition): boolean {
    return this.isTrafficLane(position) || this.isWaterLane(position);
  }

  /**
   * Get the default frog starting position (center of bottom row)
   */
  getFrogStartPosition(): GridPosition {
    return {
      x: Math.floor(GRID_COLS / 2),
      y: GRID_ROWS - 1, // Bottom row
    };
  }

  /**
   * Get the home slot positions (in the goal lane)
   * @param count - Number of home slots to get
   * @returns Array of grid positions for home slots
   */
  getHomeSlotPositions(count: number = 5): GridPosition[] {
    const slots: GridPosition[] = [];
    const startX = Math.floor((GRID_COLS - count) / 2);

    for (let i = 0; i < count; i++) {
      slots.push({
        x: startX + i * 2, // Every 2nd column
        y: 0, // Top row (goal lane)
      });
    }

    return slots;
  }

  /**
   * Convert grid position to pixel position (top-left corner of tile)
   */
  gridToPixel(position: GridPosition): PixelPosition {
    return gridToPixel(position.x, position.y);
  }

  /**
   * Convert grid position to pixel position (center of tile)
   */
  gridToPixelCenter(position: GridPosition): PixelPosition {
    return gridToPixelCenter(position.x, position.y);
  }

  /**
   * Convert pixel position to grid position
   */
  pixelToGrid(pixel: PixelPosition): GridPosition {
    return {
      x: Math.floor(pixel.x / TILE_SIZE),
      y: Math.floor(pixel.y / TILE_SIZE),
    };
  }

  /**
   * Get the direction of entities in a water or traffic lane
   */
  getLaneDirection(row: number): "left" | "right" | undefined {
    const laneConfig = LANE_CONFIG[row];
    return laneConfig?.direction;
  }

  /**
   * Get the speed of entities in a water or traffic lane
   */
  getLaneSpeed(row: number): number {
    const laneConfig = LANE_CONFIG[row];
    return laneConfig?.speed || 0;
  }

  /**
   * Get grid dimensions
   */
  getDimensions(): { cols: number; rows: number } {
    return {
      cols: GRID_COLS,
      rows: GRID_ROWS,
    };
  }

  /**
   * Check if a move from one position to another is valid
   * @param from - Starting grid position
   * @param to - Target grid position
   * @returns True if the move is within bounds
   */
  isValidMove(from: GridPosition, to: GridPosition): boolean {
    // Check if target is within bounds
    if (!this.isWithinBounds(to)) return false;

    // Check if it's a single tile move (no diagonal)
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Only allow single tile moves in one direction
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  /**
   * Get all adjacent grid positions (up, down, left, right)
   */
  getAdjacentPositions(position: GridPosition): GridPosition[] {
    const adjacent: GridPosition[] = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 }, // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }, // right
    ];

    for (const dir of directions) {
      const newPos = { x: position.x + dir.x, y: position.y + dir.y };
      if (this.isWithinBounds(newPos)) {
        adjacent.push(newPos);
      }
    }

    return adjacent;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

// Export a singleton instance for easy access
export const grid = new Grid();
