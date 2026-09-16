import type { Frog } from "./entities/frog";

/**
 * Phase 4.3 — Tracks the player's lives and handles frog death and respawn.
 */
export class Game {
  lives: number;
  gameOver = false;

  constructor(
    private readonly frog: Frog,
    private readonly startX: number,
    private readonly startY: number,
    lives = 3,
  ) {
    this.lives = lives;
  }

  /** Lose a life and respawn, or end the game when out of lives. */
  killFrog(): void {
    this.lives -= 1;
    this.frog.state = "dead";
    if (this.lives <= 0) {
      this.gameOver = true;
      return;
    }
    this.respawn();
  }

  /** Move the frog back to the starting tile. */
  respawn(): void {
    this.frog.gridX = this.startX;
    this.frog.gridY = this.startY;
    this.frog.syncPosition();
    this.frog.state = "idle";
  }
}
