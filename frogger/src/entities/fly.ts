import { Graphics } from "pixi.js";

/**
 * Phase 5.2 — A bonus fly that occasionally appears in a home slot.
 */
export class Fly extends Graphics {
  constructor(
    public readonly slotIndex: number,
    public readonly bonus = 100,
  ) {
    super();
    // Wings and body, drawn centered on the fly's position.
    this.ellipse(0, -4, 5, 3).fill(0xdddddd);
    this.ellipse(0, 0, 5, 4).fill(0x222222);
  }
}
