/**
 * Vehicle Entity for Frogger Game
 * Handles vehicle rendering, movement, and collision
 */

import { Graphics, Container, Sprite } from "pixi.js";
import { TILE_SIZE, Direction } from "../config";
import { GridPosition, PixelPosition, grid } from "../grid";

// ============================================
// VEHICLE TYPES AND CONFIGURATION
// ============================================

/**
 * Types of vehicles that can appear in traffic lanes
 */
export type VehicleType = "car" | "truck" | "bus";

/**
 * Configuration for different vehicle types
 */
const VEHICLE_CONFIG: Record<
  VehicleType,
  { width: number; height: number; color: number; speedMultiplier: number }
> = {
  car: {
    width: TILE_SIZE * 0.8,
    height: TILE_SIZE * 0.6,
    color: 0xff0000, // Red
    speedMultiplier: 1.0,
  },
  truck: {
    width: TILE_SIZE * 1.2,
    height: TILE_SIZE * 0.7,
    color: 0x0000ff, // Blue
    speedMultiplier: 0.8, // Trucks are slightly slower
  },
  bus: {
    width: TILE_SIZE * 1.5,
    height: TILE_SIZE * 0.8,
    color: 0xffff00, // Yellow
    speedMultiplier: 0.7, // Buses are slower
  },
};

// ============================================
// VEHICLE CLASS
// ============================================

/**
 * Represents a vehicle in a traffic lane
 */
export class Vehicle {
  // Visual representation
  private sprite: Graphics | Sprite;
  private container: Container;

  // Position and movement
  private gridPosition: GridPosition;
  private pixelPosition: PixelPosition;
  private direction: Direction;
  private speed: number;
  private laneRow: number;

  // Type and properties
  private type: VehicleType;
  private widthInTiles: number;
  private isActive: boolean;

  // Collision bounds
  public bounds: { x: number; y: number; width: number; height: number };

  /**
   * Create a new vehicle
   * @param type - Type of vehicle ('car', 'truck', 'bus')
   * @param laneRow - The grid row (lane) this vehicle belongs to
   * @param direction - Movement direction ('left' or 'right')
   * @param speed - Base speed in pixels per second
   * @param widthInTiles - Width of the vehicle in tiles
   */
  constructor(
    type: VehicleType = "car",
    laneRow: number,
    direction: Direction = "right",
    speed: number = 100,
    widthInTiles: number = 1,
  ) {
    // Initialize container
    this.container = new Container();
    this.laneRow = laneRow;
    this.direction = direction;
    this.speed = speed * VEHICLE_CONFIG[type].speedMultiplier;
    this.type = type;
    this.widthInTiles = widthInTiles;
    this.isActive = true;

    // Get vehicle configuration
    const config = VEHICLE_CONFIG[type];

    // Calculate pixel dimensions
    const pixelWidth = config.width * widthInTiles;
    const pixelHeight = config.height;

    // Initialize grid position (will be set properly when spawned)
    this.gridPosition = { x: 0, y: laneRow };
    this.pixelPosition = { x: 0, y: laneRow * TILE_SIZE };

    // Initialize collision bounds
    this.bounds = {
      x: -pixelWidth / 2,
      y: -pixelHeight / 2,
      width: pixelWidth,
      height: pixelHeight,
    };

    // Create visual representation using Graphics API
    this.sprite = new Graphics();
    this.createSprite(config);

    this.container.addChild(this.sprite);
  }

  /**
   * Create the vehicle sprite using Graphics API
   * @param config - Vehicle configuration
   */
  private createSprite(config: {
    width: number;
    height: number;
    color: number;
  }): void {
    const graphics = this.sprite as Graphics;
    graphics.clear();

    const pixelWidth = config.width * this.widthInTiles;
    const pixelHeight = config.height;

    // Vehicle body (rectangle)
    graphics
      .rect(-pixelWidth / 2, -pixelHeight / 2, pixelWidth, pixelHeight)
      .fill(config.color);

    // Add some details (windows, etc.)
    if (this.type === "car") {
      // Car: add windows
      const windowWidth = pixelWidth * 0.3;
      const windowHeight = pixelHeight * 0.4;
      graphics
        .rect(-windowWidth / 2, -pixelHeight / 2 + 5, windowWidth, windowHeight)
        .fill(0xaaaaaa); // Light gray windows
    } else if (this.type === "truck") {
      // Truck: add cargo area
      const cargoWidth = pixelWidth * 0.6;
      const cargoHeight = pixelHeight * 0.5;
      graphics.rect(-cargoWidth / 2, 0, cargoWidth, cargoHeight).fill(0x555555); // Dark gray cargo
    } else if (this.type === "bus") {
      // Bus: add windows in a row
      const windowWidth = pixelWidth * 0.15;
      const windowHeight = pixelHeight * 0.3;
      const windowSpacing = pixelWidth * 0.1;

      for (let i = 0; i < 4; i++) {
        const x = -pixelWidth / 2 + 10 + i * (windowWidth + windowSpacing);
        graphics
          .rect(x, -pixelHeight / 2 + 5, windowWidth, windowHeight)
          .fill(0xaaaaaa);
      }
    }

    // Set pivot to center
    graphics.pivot.set(0, 0);
  }

  /**
   * Get the vehicle's container (for adding to stage)
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get the vehicle's type
   */
  getType(): VehicleType {
    return this.type;
  }

  /**
   * Get the vehicle's current grid position
   */
  getGridPosition(): GridPosition {
    return { ...this.gridPosition };
  }

  /**
   * Get the vehicle's current pixel position
   */
  getPixelPosition(): PixelPosition {
    return { ...this.pixelPosition };
  }

  /**
   * Get the vehicle's direction
   */
  getDirection(): Direction {
    return this.direction;
  }

  /**
   * Get the vehicle's speed in pixels per second
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Get the lane row this vehicle belongs to
   */
  getLaneRow(): number {
    return this.laneRow;
  }

  /**
   * Get the vehicle's width in tiles
   */
  getWidthInTiles(): number {
    return this.widthInTiles;
  }

  /**
   * Check if the vehicle is active
   */
  isActiveVehicle(): boolean {
    return this.isActive;
  }

  /**
   * Spawn the vehicle at a specific position
   * @param x - Grid column to spawn at
   */
  spawn(x: number): void {
    this.gridPosition = { x, y: this.laneRow };
    this.pixelPosition = grid.gridToPixelCenter(this.gridPosition);
    this.container.position.set(this.pixelPosition.x, this.pixelPosition.y);
    this.isActive = true;
  }

  /**
   * Despawn the vehicle (remove from active play)
   */
  despawn(): void {
    this.isActive = false;
    // Could also remove from stage here, but better to let the manager handle it
  }

  /**
   * Update the vehicle's position based on its speed and direction
   * @param delta - Time since last frame in seconds
   */
  update(delta: number): void {
    if (!this.isActive) return;

    // Calculate movement based on direction and speed
    const movement = this.speed * delta;

    if (this.direction === "right") {
      this.pixelPosition.x += movement;
    } else {
      this.pixelPosition.x -= movement;
    }

    // Update grid position based on pixel position
    const newGridPos = grid.pixelToGrid(this.pixelPosition);
    if (
      newGridPos.x !== this.gridPosition.x ||
      newGridPos.y !== this.gridPosition.y
    ) {
      this.gridPosition = newGridPos;
    }

    // Update container position
    this.container.position.set(this.pixelPosition.x, this.pixelPosition.y);

    // Check if vehicle is off-screen (for despawn logic)
    // This would typically be handled by the lane manager
  }

  /**
   * Get the vehicle's collision bounds in pixel coordinates
   */
  getCollisionBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: this.pixelPosition.x + this.bounds.x,
      y: this.pixelPosition.y + this.bounds.y,
      width: this.bounds.width,
      height: this.bounds.height,
    };
  }

  /**
   * Check if this vehicle collides with another entity's bounds
   * @param otherBounds - Bounds of the other entity
   */
  checkCollision(otherBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    const myBounds = this.getCollisionBounds();
    return (
      myBounds.x < otherBounds.x + otherBounds.width &&
      myBounds.x + myBounds.width > otherBounds.x &&
      myBounds.y < otherBounds.y + otherBounds.height &&
      myBounds.y + myBounds.height > otherBounds.y
    );
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.container.destroy({ children: true });
  }
}

// ============================================
// VEHICLE FACTORY
// ============================================

/**
 * Factory function to create vehicles based on configuration
 * @param type - Type of vehicle
 * @param laneRow - The grid row for this vehicle
 * @param direction - Movement direction
 * @param speed - Base speed
 * @param widthInTiles - Width in tiles
 * @returns New Vehicle instance
 */
export function createVehicle(
  type: VehicleType,
  laneRow: number,
  direction: Direction,
  speed: number,
  widthInTiles: number = 1,
): Vehicle {
  return new Vehicle(type, laneRow, direction, speed, widthInTiles);
}
