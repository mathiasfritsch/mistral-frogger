import { Graphics } from "pixi.js";
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from "../config";
import { gridToPixel } from "../grid";
import type { Direction } from "../input";

/**
 * Phase 2.1 — The frog. Position is tracked in grid coordinates and snapped
 * to pixel coordinates after every hop.
 */
export class Frog extends Graphics {
  state: "idle" | "moving" | "dead" | "safe" = "idle";

  constructor(
    public gridX: number,
    public gridY: number,
  ) {
    super();
    this.circle(0, 0, TILE_SIZE / 2 - 4).fill(0x00ff00);
    this.syncPosition();
  }

  /** Snap the sprite to the current grid coordinates. */
  syncPosition(): void {
    const { x, y } = gridToPixel(this.gridX, this.gridY);
    this.x = x + TILE_SIZE / 2;
    this.y = y + TILE_SIZE / 2;
  }

  /** Recompute grid coordinates from the current pixel position. */
  updateGridFromPosition(): void {
    const half = TILE_SIZE / 2;
    this.gridX = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.round((this.x - half) / TILE_SIZE)),
    );
    this.gridY = Math.max(
      0,
      Math.min(GRID_ROWS - 1, Math.round((this.y - half) / TILE_SIZE)),
    );
  }

  /**
   * Hop one tile in the given direction. The hop is relative to the current
   * pixel position so that a frog riding a platform keeps its carried offset.
   */
  hop(direction: Direction): void {
    this.state = "moving";
    switch (direction) {
      case "up":
        this.y -= TILE_SIZE;
        break;
      case "down":
        this.y += TILE_SIZE;
        break;
      case "left":
        this.x -= TILE_SIZE;
        break;
      case "right":
        this.x += TILE_SIZE;
        break;
    }

    // Clamp to the play field, keeping the frog centered in its tile.
    const half = TILE_SIZE / 2;
    this.x = Math.max(half, Math.min(GRID_COLS * TILE_SIZE - half, this.x));
    this.y = Math.max(half, Math.min(GRID_ROWS * TILE_SIZE - half, this.y));

    this.updateGridFromPosition();
    this.state = "idle";
  }
}
