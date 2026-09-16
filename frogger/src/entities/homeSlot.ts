import { Graphics } from "pixi.js";
import { TILE_SIZE } from "../config";
import { gridToPixel } from "../grid";

/**
 * Phase 2.4 — A home slot in the goal row where frogs must land.
 */
export class HomeSlot extends Graphics {
  state: "empty" | "filled" | "fly" | "alligator" = "empty";

  constructor(public readonly column: number) {
    super();
    this.draw();
    const { x, y } = gridToPixel(this.column, 0);
    this.x = x + TILE_SIZE / 2;
    this.y = y + TILE_SIZE / 2;
  }

  private draw(): void {
    this.clear();
    const size = TILE_SIZE - 10;
    const filled = this.state === "filled";
    this.roundRect(-size / 2, -size / 2, size, size, 8).fill(
      filled ? 0x27ae60 : 0x2c3e50,
    );
    if (filled) {
      this.circle(0, 0, TILE_SIZE / 2 - 10).fill(0x00ff00);
    }
  }

  fillSlot(): void {
    this.state = "filled";
    this.draw();
  }
}
