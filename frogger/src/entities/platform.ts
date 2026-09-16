import { Graphics } from "pixi.js";
import { GRID_COLS, TILE_SIZE } from "../config";
import type { HorizontalDirection, PlatformType } from "../config";

/** Seconds a turtle stays on the surface before diving. */
const TURTLE_VISIBLE_SECONDS = 3;

/** Seconds a turtle stays submerged before resurfacing. */
const TURTLE_SUBMERGED_SECONDS = 1.5;

/**
 * Phase 2.3 — A floating platform (log or turtle) for the water lanes.
 * Turtles dive on a timer, temporarily removing their safe surface.
 */
export class Platform extends Graphics {
  private diveTimer = TURTLE_VISIBLE_SECONDS;
  submerged = false;

  constructor(
    public readonly type: PlatformType,
    public readonly direction: HorizontalDirection,
    public readonly speed: number,
    public readonly laneRow: number,
    public readonly widthTiles = 1,
  ) {
    super();
    const width = this.widthTiles * TILE_SIZE - 6;
    const height = TILE_SIZE - 8;
    if (this.type === "turtle") {
      this.ellipse(0, 0, width / 2, height / 2).fill(0x2ecc71);
    } else {
      this.roundRect(-width / 2, -height / 2, width, height, 6).fill(0x8b5a2b);
    }
    this.y = this.laneRow * TILE_SIZE + TILE_SIZE / 2;
    this.x = this.direction === 1 ? -width : GRID_COLS * TILE_SIZE + width;
  }

  /** Move across the lane, wrap around, and cycle turtle dives. */
  update(deltaSeconds: number): void {
    const span = this.widthTiles * TILE_SIZE;
    const screenWidth = GRID_COLS * TILE_SIZE;
    this.x += this.speed * this.direction * deltaSeconds;
    if (this.direction === 1 && this.x > screenWidth + span) this.x = -span;
    if (this.direction === -1 && this.x < -span) this.x = screenWidth + span;

    if (this.type === "turtle") {
      this.diveTimer -= deltaSeconds;
      if (this.diveTimer <= 0) {
        this.submerged = !this.submerged;
        this.visible = !this.submerged;
        this.diveTimer = this.submerged
          ? TURTLE_SUBMERGED_SECONDS
          : TURTLE_VISIBLE_SECONDS;
      }
    }
  }
}
