import { Graphics } from "pixi.js";
import { TILE_SIZE } from "../config";
import { clampToGrid, gridToPixel } from "../grid";
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

  /** Hop one tile in the given direction, clamped to the play field. */
  hop(direction: Direction): void {
    this.state = "moving";
    switch (direction) {
      case "up":
        this.gridY -= 1;
        break;
      case "down":
        this.gridY += 1;
        break;
      case "left":
        this.gridX -= 1;
        break;
      case "right":
        this.gridX += 1;
        break;
    }
    const clamped = clampToGrid(this.gridX, this.gridY);
    this.gridX = clamped.x;
    this.gridY = clamped.y;
    this.syncPosition();
    this.state = "idle";
  }
}
