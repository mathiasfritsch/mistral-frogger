import { Container } from "pixi.js";
import { GRID_COLS, LANE_CONFIG, TILE_SIZE } from "./config";
import type { LaneConfig, TrafficLane, WaterLane } from "./config";
import { TRAFFIC_ROWS, WATER_ROWS } from "./grid";
import { Platform } from "./entities/platform";
import { Vehicle } from "./entities/vehicle";

/**
 * Phase 3.1 / 3.2 — Manages the traffic and water lanes. Spawns vehicles and
 * platforms from the lane configuration and updates them every frame. Entities
 * wrap around the screen edges instead of being despawned and recreated.
 */
export class LaneManager extends Container {
  readonly vehicles: Vehicle[] = [];
  readonly platforms: Platform[] = [];

  constructor(config: LaneConfig = LANE_CONFIG) {
    super();
    this.populateTraffic(config.traffic);
    this.populateWater(config.water);
  }

  /** Move every vehicle and platform by one frame. */
  update(deltaSeconds: number): void {
    for (const vehicle of this.vehicles) vehicle.update(deltaSeconds);
    for (const platform of this.platforms) platform.update(deltaSeconds);
  }

  private populateTraffic(lanes: TrafficLane[]): void {
    const screenWidth = GRID_COLS * TILE_SIZE;
    lanes.forEach((lane, index) => {
      const row = TRAFFIC_ROWS[index];
      for (let i = 0; i < lane.count; i++) {
        const vehicle = new Vehicle(lane.type, lane.direction, lane.speed, row);
        // Spread vehicles evenly across the lane.
        vehicle.x = ((i + 0.5) * screenWidth) / lane.count;
        this.vehicles.push(vehicle);
        this.addChild(vehicle);
      }
    });
  }

  private populateWater(lanes: WaterLane[]): void {
    const screenWidth = GRID_COLS * TILE_SIZE;
    lanes.forEach((lane, index) => {
      const row = WATER_ROWS[index];
      lane.platforms.forEach((spec, i) => {
        const platform = new Platform(
          spec.type,
          lane.direction,
          lane.speed,
          row,
          spec.width,
        );
        // Spread platforms evenly across the lane.
        platform.x = ((i + 0.5) * screenWidth) / lane.platforms.length;
        this.platforms.push(platform);
        this.addChild(platform);
      });
    });
  }
}
