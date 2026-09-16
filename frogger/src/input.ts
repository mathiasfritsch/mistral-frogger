/** Direction of a single frog hop. */
export type Direction = "up" | "down" | "left" | "right";

const KEY_BINDINGS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

const DIRECTION_PRIORITY: Direction[] = ["up", "down", "left", "right"];

/**
 * Tracks keyboard input for grid-based movement. Movement is consumed once
 * per keypress: holding a key does not buffer repeated hops, and only one
 * direction is returned per frame (no diagonal movement).
 */
export class KeyManager {
  private readonly pressed = new Set<Direction>();

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return; // Only a fresh keypress triggers a hop.
    const direction = KEY_BINDINGS[event.key];
    if (direction) this.pressed.add(direction);
  };

  /** Returns and clears a single pending direction, or null if none. */
  consumeDirection(): Direction | null {
    if (this.pressed.size === 0) return null;
    for (const direction of DIRECTION_PRIORITY) {
      if (this.pressed.has(direction)) {
        this.pressed.clear();
        return direction;
      }
    }
    return null;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}
