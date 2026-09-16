import { LANE_CONFIG } from "./config";
import type { LaneConfig } from "./config";

/**
 * Phase 3.3 — Tracks level progression: home-slot state, level completion,
 * and difficulty scaling (speed and density increase per level).
 */
export class Level {
  readonly number: number;
  readonly slots: boolean[];
  readonly speedMultiplier: number;
  readonly densityMultiplier: number;

  constructor(number = 1, slotCount = 5) {
    this.number = number;
    this.slots = Array.from({ length: slotCount }, () => false);
    this.speedMultiplier = 1 + (number - 1) * 0.15;
    this.densityMultiplier = 1 + (number - 1) * 0.1;
  }

  /** Number of home slots that have been filled. */
  get filledCount(): number {
    return this.slots.filter(Boolean).length;
  }

  /** True once every home slot is filled. */
  get isComplete(): boolean {
    return this.filledCount === this.slots.length;
  }

  fillSlot(index: number): void {
    if (index >= 0 && index < this.slots.length) this.slots[index] = true;
  }

  /** Lane configuration for this level with difficulty scaling applied. */
  get laneConfig(): LaneConfig {
    return {
      traffic: LANE_CONFIG.traffic.map((lane) => ({
        ...lane,
        speed: Math.round(lane.speed * this.speedMultiplier),
        count: Math.min(4, Math.ceil(lane.count * this.densityMultiplier)),
      })),
      water: LANE_CONFIG.water.map((lane) => ({
        ...lane,
        speed: Math.round(lane.speed * this.speedMultiplier),
      })),
    };
  }
}
