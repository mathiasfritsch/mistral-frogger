/**
 * Platform Entity for Frogger Game
 * Handles logs, turtles, and alligators in water lanes
 */

import { Graphics, Container, Sprite } from "pixi.js";
import { TILE_SIZE, Direction } from "../config";
import { GridPosition, PixelPosition, grid } from "../grid";

// ============================================
// PLATFORM TYPES AND CONFIGURATION
// ============================================

/**
 * Types of platforms that can appear in water lanes
 */
export type PlatformType = "log" | "turtle" | "alligator";

/**
 * State of a turtle (for submerge animation)
 */
export type TurtleState = "above" | "submerging" | "below" | "emerging";

/**
 * State of an alligator (for mouth animation)
 */
export type AlligatorState = "closed" | "opening" | "open" | "closing";

/**
 * Configuration for different platform types
 */
const PLATFORM_CONFIG: Record<
  PlatformType,
  { width: number; height: number; color: number }
> = {
  log: {
    width: TILE_SIZE * 1.5,
    height: TILE_SIZE * 0.4,
    color: 0x8b4513, // Brown
  },
  turtle: {
    width: TILE_SIZE * 0.8,
    height: TILE_SIZE * 0.5,
    color: 0x008000, // Green
  },
  alligator: {
    width: TILE_SIZE * 1.2,
    height: TILE_SIZE * 0.6,
    color: 0x228b22, // Dark green
  },
};

// ============================================
// PLATFORM CLASS
// ============================================

/**
 * Represents a platform in a water lane (log, turtle, or alligator)
 */
export class Platform {
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
  private type: PlatformType;
  private widthInTiles: number;
  private isActive: boolean;

  // Animation states
  private turtleState: TurtleState;
  private alligatorState: AlligatorState;
  private submergeTimer: number;
  private isSubmerged: boolean;

  // Collision bounds
  public bounds: { x: number; y: number; width: number; height: number };

  /**
   * Create a new platform
   * @param type - Type of platform ('log', 'turtle', 'alligator')
   * @param laneRow - The grid row (lane) this platform belongs to
   * @param direction - Movement direction ('left' or 'right')
   * @param speed - Base speed in pixels per second
   * @param widthInTiles - Width of the platform in tiles
   */
  constructor(
    type: PlatformType = "log",
    laneRow: number,
    direction: Direction = "right",
    speed: number = 100,
    widthInTiles: number = 1,
  ) {
    // Initialize container
    this.container = new Container();
    this.laneRow = laneRow;
    this.direction = direction;
    this.speed = speed;
    this.type = type;
    this.widthInTiles = widthInTiles;
    this.isActive = true;

    // Get platform configuration
    const config = PLATFORM_CONFIG[type];

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

    // Initialize animation states
    this.turtleState = "above";
    this.alligatorState = "closed";
    this.submergeTimer = 0;
    this.isSubmerged = false;

    // Create visual representation using Graphics API
    this.sprite = new Graphics();
    this.createSprite(config);

    this.container.addChild(this.sprite);
  }

  /**
   * Create the platform sprite using Graphics API
   * @param config - Platform configuration
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

    if (this.type === "log") {
      // Log: simple brown rectangle with wood grain texture (approximated)
      graphics
        .rect(-pixelWidth / 2, -pixelHeight / 2, pixelWidth, pixelHeight)
        .fill(config.color);

      // Add wood grain lines
      const lineColor = 0x654321;
      const lineSpacing = 4;
      for (
        let i = -Math.floor(pixelWidth / 2);
        i < Math.floor(pixelWidth / 2);
        i += lineSpacing
      ) {
        graphics
          .lineStyle(1, lineColor)
          .moveTo(i, -pixelHeight / 2)
          .lineTo(i + lineSpacing / 2, pixelHeight / 2);
      }
    } else if (this.type === "turtle") {
      // Turtle: green oval shape
      graphics
        .ellipse(0, 0, pixelWidth / 2, pixelHeight / 2)
        .fill(config.color);

      // Add turtle shell pattern
      const shellColor = 0x228b22;
      graphics.ellipse(0, -5, pixelWidth / 3, pixelHeight / 3).fill(shellColor);

      // Add eyes
      graphics.circle(-8, -2, 2).circle(8, -2, 2).fill(0x000000);
    } else if (this.type === "alligator") {
      // Alligator: elongated shape with open/closed mouth
      const headWidth = pixelWidth * 0.3;
      const bodyWidth = pixelWidth * 0.7;

      // Body
      graphics
        .rect(-bodyWidth / 2, -pixelHeight / 2, bodyWidth, pixelHeight)
        .fill(config.color);

      // Head
      graphics
        .rect(bodyWidth / 2, -pixelHeight / 2 + 2, headWidth, pixelHeight - 4)
        .fill(config.color);

      // Eyes
      graphics
        .circle(bodyWidth / 2 + 5, -pixelHeight / 4, 2)
        .circle(bodyWidth / 2 + 10, -pixelHeight / 4, 2)
        .fill(0xffff00);
    }

    // Set pivot to center
    graphics.pivot.set(0, 0);
  }

  /**
   * Get the platform's container (for adding to stage)
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get the platform's type
   */
  getType(): PlatformType {
    return this.type;
  }

  /**
   * Get the platform's current grid position
   */
  getGridPosition(): GridPosition {
    return { ...this.gridPosition };
  }

  /**
   * Get the platform's current pixel position
   */
  getPixelPosition(): PixelPosition {
    return { ...this.pixelPosition };
  }

  /**
   * Get the platform's direction
   */
  getDirection(): Direction {
    return this.direction;
  }

  /**
   * Get the platform's speed in pixels per second
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Get the lane row this platform belongs to
   */
  getLaneRow(): number {
    return this.laneRow;
  }

  /**
   * Get the platform's width in tiles
   */
  getWidthInTiles(): number {
    return this.widthInTiles;
  }

  /**
   * Check if the platform is active
   */
  isActivePlatform(): boolean {
    return this.isActive;
  }

  /**
   * Check if the platform is currently submerged (for turtles)
   */
  getIsSubmerged(): boolean {
    return this.isSubmerged;
  }

  /**
   * Check if the platform's mouth is open (for alligators)
   */
  isMouthOpen(): boolean {
    return this.alligatorState === "open";
  }

  /**
   * Spawn the platform at a specific position
   * @param x - Grid column to spawn at
   */
  spawn(x: number): void {
    this.gridPosition = { x, y: this.laneRow };
    this.pixelPosition = grid.gridToPixelCenter(this.gridPosition);
    this.container.position.set(this.pixelPosition.x, this.pixelPosition.y);
    this.isActive = true;
    this.isSubmerged = false;
    this.turtleState = "above";
    this.alligatorState = "closed";
    this.submergeTimer = 0;
  }

  /**
   * Despawn the platform (remove from active play)
   */
  despawn(): void {
    this.isActive = false;
  }

  /**
   * Update the platform's position and animations
   * @param delta - Time since last frame in seconds
   */
  update(delta: number): void {
    if (!this.isActive) return;

    // Update movement based on direction and speed
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

    // Update animations based on platform type
    if (this.type === "turtle") {
      this.updateTurtleAnimation(delta);
    } else if (this.type === "alligator") {
      this.updateAlligatorAnimation(delta);
    }
  }

  /**
   * Update turtle submerge/emerge animation
   * @param delta - Time since last frame in seconds
   */
  private updateTurtleAnimation(delta: number): void {
    this.submergeTimer += delta;

    // Randomly decide to submerge
    if (this.turtleState === "above" && Math.random() < 0.002) {
      this.turtleState = "submerging";
      this.submergeTimer = 0;
    }

    // Randomly decide to emerge
    if (this.turtleState === "below" && Math.random() < 0.002) {
      this.turtleState = "emerging";
      this.submergeTimer = 0;
    }

    // Handle submerge animation
    if (this.turtleState === "submerging") {
      this.submergeTimer += delta;
      const progress = this.submergeTimer / 0.5; // 0.5 second animation

      if (progress >= 1) {
        this.turtleState = "below";
        this.isSubmerged = true;
        // Recreate sprite to show submerged state
        this.createSprite(PLATFORM_CONFIG[this.type]);
      }
    }

    // Handle emerge animation
    if (this.turtleState === "emerging") {
      this.submergeTimer += delta;
      const progress = this.submergeTimer / 0.5; // 0.5 second animation

      if (progress >= 1) {
        this.turtleState = "above";
        this.isSubmerged = false;
        // Recreate sprite to show above state
        this.createSprite(PLATFORM_CONFIG[this.type]);
      }
    }
  }

  /**
   * Update alligator mouth animation
   * @param delta - Time since last frame in seconds
   */
  private updateAlligatorAnimation(delta: number): void {
    this.submergeTimer += delta;

    // Cycle through mouth states
    if (this.alligatorState === "closed" && this.submergeTimer > 2) {
      this.alligatorState = "opening";
      this.submergeTimer = 0;
    } else if (this.alligatorState === "opening" && this.submergeTimer > 0.3) {
      this.alligatorState = "open";
      this.submergeTimer = 0;
    } else if (this.alligatorState === "open" && this.submergeTimer > 1) {
      this.alligatorState = "closing";
      this.submergeTimer = 0;
    } else if (this.alligatorState === "closing" && this.submergeTimer > 0.3) {
      this.alligatorState = "closed";
      this.submergeTimer = 0;
    }

    // Update sprite based on mouth state
    this.updateAlligatorSprite();
  }

  /**
   * Update alligator sprite based on mouth state
   */
  private updateAlligatorSprite(): void {
    const graphics = this.sprite as Graphics;
    graphics.clear();

    const config = PLATFORM_CONFIG[this.type];
    const pixelWidth = config.width * this.widthInTiles;
    const pixelHeight = config.height;

    const headWidth = pixelWidth * 0.3;
    const bodyWidth = pixelWidth * 0.7;

    // Body
    graphics
      .rect(-bodyWidth / 2, -pixelHeight / 2, bodyWidth, pixelHeight)
      .fill(config.color);

    // Head
    graphics
      .rect(bodyWidth / 2, -pixelHeight / 2 + 2, headWidth, pixelHeight - 4)
      .fill(config.color);

    // Eyes
    graphics
      .circle(bodyWidth / 2 + 5, -pixelHeight / 4, 2)
      .circle(bodyWidth / 2 + 10, -pixelHeight / 4, 2)
      .fill(0xffff00);

    // Mouth (based on state)
    if (this.alligatorState === "open") {
      // Open mouth - red
      const mouthWidth = headWidth * 0.8;
      const mouthHeight = pixelHeight * 0.4;
      graphics
        .rect(
          bodyWidth / 2 + headWidth / 2 - mouthWidth / 2,
          0,
          mouthWidth,
          mouthHeight,
        )
        .fill(0xff0000);

      // Teeth
      graphics
        .lineStyle(1, 0xffffff)
        .moveTo(bodyWidth / 2 + headWidth / 2 - mouthWidth / 2 + 2, 0)
        .lineTo(
          bodyWidth / 2 + headWidth / 2 - mouthWidth / 2 + 2,
          mouthHeight,
        );
      graphics
        .moveTo(bodyWidth / 2 + headWidth / 2 - mouthWidth / 2 + 6, 0)
        .lineTo(
          bodyWidth / 2 + headWidth / 2 - mouthWidth / 2 + 6,
          mouthHeight,
        );
      graphics
        .moveTo(bodyWidth / 2 + headWidth / 2 - mouthWidth / 2 + 10, 0)
        .lineTo(
          bodyWidth / 2 + headWidth / 2 - mouthWidth / 2 + 10,
          mouthHeight,
        );
    } else if (
      this.alligatorState === "opening" ||
      this.alligatorState === "closing"
    ) {
      // Partially open mouth
      const progress =
        this.alligatorState === "opening"
          ? this.submergeTimer / 0.3
          : 1 - this.submergeTimer / 0.3;
      const mouthHeight = pixelHeight * 0.4 * progress;
      graphics
        .rect(
          bodyWidth / 2 + headWidth / 2 - headWidth / 4,
          -pixelHeight / 2 + 2,
          headWidth / 2,
          mouthHeight,
        )
        .fill(0xff0000);
    }
    // else: mouth is closed, no special drawing needed
  }

  /**
   * Get the platform's collision bounds in pixel coordinates
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
   * Check if this platform can support the frog (not submerged)
   */
  canSupportFrog(): boolean {
    if (this.type === "turtle") {
      return !this.isSubmerged;
    }
    // Logs and alligators always support the frog
    // (Note: alligator mouths might be hazardous, but that's handled separately)
    return true;
  }

  /**
   * Check if this platform collides with another entity's bounds
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
// PLATFORM FACTORY
// ============================================

/**
 * Factory function to create platforms based on configuration
 * @param type - Type of platform
 * @param laneRow - The grid row for this platform
 * @param direction - Movement direction
 * @param speed - Base speed
 * @param widthInTiles - Width in tiles
 * @returns New Platform instance
 */
export function createPlatform(
  type: PlatformType,
  laneRow: number,
  direction: Direction,
  speed: number,
  widthInTiles: number = 1,
): Platform {
  return new Platform(type, laneRow, direction, speed, widthInTiles);
}
