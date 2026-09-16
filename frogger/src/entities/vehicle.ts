import { Graphics } from "pixi.js";
import { GRID_COLS, TILE_SIZE } from "../config";
import type { HorizontalDirection, VehicleType } from "../config";

/**
 * Phase 2.2 — A vehicle that drives across a traffic lane and wraps around
 * the screen edges.
 */
export class Vehicle extends Graphics {
  constructor(
    public readonly type: VehicleType,
    public readonly direction: HorizontalDirection,
    public readonly speed: number,
    public readonly laneRow: number,
    public readonly lengthTiles = 1,
  ) {
    super();
    const visualWidth = this.lengthTiles * TILE_SIZE - 8;
    const height = TILE_SIZE - 10;
    const color = this.type === "car" ? 0xe74c3c : 0x8e44ad;
    this.rect(-visualWidth / 2, -height / 2, visualWidth, height).fill(color);
    this.y = this.laneRow * TILE_SIZE + TILE_SIZE / 2;
    this.x =
      this.direction === 1 ? -visualWidth : GRID_COLS * TILE_SIZE + visualWidth;
  }

  /** Move across the lane and wrap around the screen edges. */
  update(delta: number): void {
    const span = this.lengthTiles * TILE_SIZE;
    const screenWidth = GRID_COLS * TILE_SIZE;
    this.x += this.speed * this.direction * delta;
    if (this.direction === 1 && this.x > screenWidth + span) this.x = -span;
    if (this.direction === -1 && this.x < -span) this.x = screenWidth + span;
  }
}
