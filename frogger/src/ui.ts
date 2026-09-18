import { Container, Graphics } from "pixi.js";
import { TILE_SIZE } from "./config";

/**
 * Phase 5.4 — Displays remaining lives as frog icons in the top-left corner.
 */
export class LivesUI extends Container {
  /** Redraw the life icons to match the given count. */
  setLives(lives: number): void {
    while (this.children.length > 0) {
      const icon = this.children[0];
      this.removeChild(icon);
      icon.destroy();
    }
    for (let i = 0; i < lives; i++) {
      const icon = new Graphics()
        .circle(0, 0, TILE_SIZE / 2 - 6)
        .fill(0x00ff00);
      icon.x = 20 + i * (TILE_SIZE + 4);
      icon.y = 20;
      this.addChild(icon);
    }
  }
}
