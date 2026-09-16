import type { Container } from "pixi.js";

/**
 * Phase 4.1 — Axis-aligned bounding-box collision detection between two
 * display objects, using their world-space bounds.
 */
export class CollisionSystem {
  /** True when the bounds of `a` and `b` overlap. */
  static checkCollision(a: Container, b: Container): boolean {
    const boundsA = a.getBounds();
    const boundsB = b.getBounds();
    return (
      boundsA.x < boundsB.x + boundsB.width &&
      boundsA.x + boundsA.width > boundsB.x &&
      boundsA.y < boundsB.y + boundsB.height &&
      boundsA.y + boundsA.height > boundsB.y
    );
  }
}
