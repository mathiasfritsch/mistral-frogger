import { LANE, TILE_SIZE } from "./config";
import { getLaneType } from "./grid";
import { CollisionSystem } from "./collision";
import type { Frog } from "./entities/frog";
import type { Platform } from "./entities/platform";

/** Result of evaluating the frog's position relative to the water lanes. */
export type WaterOutcome = "riding" | "drowned" | "carried-off" | null;

/**
 * Phase 4.2 — Resolve the frog's state when it sits on a water lane. Returns
 * null when the frog is not over water. If the frog rides a platform, it is
 * carried along with the platform's movement.
 */
export function resolveWater(
  frog: Frog,
  platforms: Platform[],
  screenWidth: number,
  deltaSeconds: number,
): WaterOutcome {
  if (getLaneType(frog.gridY) !== LANE.WATER) return null;

  const platform = platforms.find(
    (candidate) =>
      candidate.laneRow === frog.gridY &&
      !candidate.submerged &&
      CollisionSystem.checkCollision(frog, candidate),
  );

  if (!platform) return "drowned";

  // Ride the platform: carry the frog along with its movement.
  frog.x += platform.speed * platform.direction * deltaSeconds;
  frog.updateGridFromPosition();

  // Carried off the left or right edge of the screen → lost.
  const margin = TILE_SIZE / 2;
  if (frog.x < -margin || frog.x > screenWidth + margin) return "carried-off";

  return "riding";
}
