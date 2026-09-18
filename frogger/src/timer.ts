import { Text } from "pixi.js";
import { TIME_LIMIT } from "./config";

const FONT_SIZE = 24;

/**
 * Phase 4.4 — Per-frog countdown. When the timer expires, the frog must die.
 */
export class FrogTimer {
  private remaining: number;
  private warning = false;
  readonly display: Text;

  constructor(duration = TIME_LIMIT) {
    this.remaining = duration;
    this.display = new Text({
      text: this.format(this.remaining),
      style: { fontSize: FONT_SIZE, fill: 0xffffff },
    });
  }

  get expired(): boolean {
    return this.remaining <= 0;
  }

  /** Seconds remaining on the current countdown. */
  get secondsLeft(): number {
    return this.remaining;
  }

  /** Restart the countdown (e.g., after a respawn). */
  reset(duration = TIME_LIMIT): void {
    this.remaining = duration;
    this.warning = false;
    this.updateDisplay();
  }

  update(deltaSeconds: number): void {
    if (this.remaining <= 0) return;
    this.remaining = Math.max(0, this.remaining - deltaSeconds);
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.display.text = this.format(this.remaining);
    const low = this.remaining <= 5;
    if (low !== this.warning) {
      this.warning = low;
      this.display.style = {
        fontSize: FONT_SIZE,
        fill: low ? 0xff5555 : 0xffffff,
      };
    }
  }

  private format(seconds: number): string {
    return Math.ceil(seconds).toString();
  }
}
