/** Phase 5.1 / 5.3 — Scoring and extra lives. */

const HOME_POINTS = 10;
const ADJACENT_BONUS = 10;
const TIME_BONUS_MULTIPLIER = 10;
const EXTRA_LIFE_INTERVAL = 10000;

export interface ScoreResult {
  points: number;
  extraLives: number;
}

export class ScoreManager {
  private points = 0;
  private nextExtraLifeAt = EXTRA_LIFE_INTERVAL;

  get score(): number {
    return this.points;
  }

  /** Score a successful landing in a home slot. */
  scoreHomeSlot(emptyAdjacent: number, remainingSeconds: number): ScoreResult {
    const points =
      HOME_POINTS +
      ADJACENT_BONUS * emptyAdjacent +
      Math.ceil(remainingSeconds) * TIME_BONUS_MULTIPLIER;
    return this.add(points);
  }

  /** Score a bonus (e.g., catching a fly). */
  scoreBonus(points: number): ScoreResult {
    return this.add(points);
  }

  private add(points: number): ScoreResult {
    this.points += points;
    let extraLives = 0;
    while (this.points >= this.nextExtraLifeAt) {
      this.nextExtraLifeAt += EXTRA_LIFE_INTERVAL;
      extraLives += 1;
    }
    return { points, extraLives };
  }
}
