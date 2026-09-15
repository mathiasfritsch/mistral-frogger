/**
 * Frog Entity for Frogger Game
 * Handles frog rendering, movement, state, and animations
 */

import { Graphics, Container } from "pixi.js";
import { TILE_SIZE } from "../config";
import { GridPosition, PixelPosition, grid } from "../grid";
import { MovementController } from "../input";

// ============================================
// FROG STATE TYPES
// ============================================

/**
 * Possible states for the frog
 */
export type FrogState = "idle" | "moving" | "dead" | "safe" | "hopping";

// ============================================
// FROG CONFIGURATION
// ============================================

const FROG_COLOR = 0x00ff00; // Green
const FROG_EYE_COLOR = 0xffffff; // White
const FROG_PUPIL_COLOR = 0x000000; // Black
const FROG_SIZE = TILE_SIZE / 2 - 5; // Slightly smaller than tile
const FROG_EYE_SIZE = 3;
const FROG_PUPIL_SIZE = 1;

// ============================================
// FROG CLASS
// ============================================

/**
 * Represents the player's frog in the game
 */
export class Frog {
  // Visual representation
  private sprite: Graphics;
  private container: Container;

  // Position and movement
  private gridPosition: GridPosition;
  private pixelPosition: PixelPosition;
  private targetPosition: GridPosition | null;
  private moveProgress: number;

  // State
  private state: FrogState;
  private isActive: boolean;

  // Movement controller reference
  private movementController: MovementController;

  // Animation
  private hopScale: number;
  private hopDirection: number; // 1 for expanding, -1 for contracting
  private isHopping: boolean;

  // Collision bounds
  public bounds: { x: number; y: number; width: number; height: number };

  /**
   * Create a new frog instance
   * @param movementController - Reference to the movement controller
   */
  constructor(movementController: MovementController) {
    // Initialize container and sprite
    this.container = new Container();
    this.sprite = new Graphics();
    this.container.addChild(this.sprite);

    // Initialize position
    this.gridPosition = grid.getFrogStartPosition();
    this.pixelPosition = grid.gridToPixelCenter(this.gridPosition);
    this.targetPosition = null;
    this.moveProgress = 0;

    // Initialize state
    this.state = "idle";
    this.isActive = true;
    this.movementController = movementController;

    // Initialize animation
    this.hopScale = 1.0;
    this.hopDirection = 1;
    this.isHopping = false;

    // Initialize collision bounds (slightly smaller than tile)
    this.bounds = {
      x: -FROG_SIZE,
      y: -FROG_SIZE,
      width: FROG_SIZE * 2,
      height: FROG_SIZE * 2,
    };

    // Create the frog visual
    this.createSprite();

    // Position the sprite
    this.updateSpritePosition();
  }

  /**
   * Create the frog's visual representation using Graphics API
   */
  private createSprite(): void {
    this.sprite.clear();

    // Body (circle)
    this.sprite
      .circle(0, 0, FROG_SIZE)
      .fill(FROG_COLOR)
      // Eyes
      .circle(-8, -5, FROG_EYE_SIZE)
      .circle(8, -5, FROG_EYE_SIZE)
      .fill(FROG_EYE_COLOR)
      // Pupils
      .circle(-8, -5, FROG_PUPIL_SIZE)
      .circle(8, -5, FROG_PUPIL_SIZE)
      .fill(FROG_PUPIL_COLOR);

    // Set pivot to center
    this.sprite.pivot.set(0, 0);
  }

  /**
   * Get the frog's container (for adding to stage)
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get the frog's current grid position
   */
  getGridPosition(): GridPosition {
    return { ...this.gridPosition };
  }

  /**
   * Get the frog's current pixel position (center)
   */
  getPixelPosition(): PixelPosition {
    return { ...this.pixelPosition };
  }

  /**
   * Get the frog's current state
   */
  getState(): FrogState {
    return this.state;
  }

  /**
   * Check if the frog is currently moving
   */
  isMoving(): boolean {
    return this.state === "moving" || this.state === "hopping";
  }

  /**
   * Check if the frog is active (not dead)
   */
  isActiveFrog(): boolean {
    return this.isActive;
  }

  /**
   * Reset the frog to its starting position
   */
  reset(): void {
    this.gridPosition = grid.getFrogStartPosition();
    this.targetPosition = null;
    this.moveProgress = 0;
    this.state = "idle";
    this.isActive = true;
    this.hopScale = 1.0;
    this.isHopping = false;
    this.updateSpritePosition();
  }

  /**
   * Set the frog as inactive (dead)
   */
  die(): void {
    this.state = "dead";
    this.isActive = false;
    this.targetPosition = null;
  }

  /**
   * Set the frog as safe (reached home slot)
   */
  setSafe(): void {
    this.state = "safe";
    this.targetPosition = null;
  }

  /**
   * Start a move to a new grid position
   * @param direction - The direction to move (grid coordinates)
   */
  startMove(direction: GridPosition): void {
    if (this.state !== "idle" && this.state !== "hopping") return;

    const target: GridPosition = {
      x: this.gridPosition.x + direction.x,
      y: this.gridPosition.y + direction.y,
    };

    // Validate the move
    if (!grid.isValidMove(this.gridPosition, target)) {
      return;
    }

    this.targetPosition = target;
    this.moveProgress = 1.0;
    this.state = "moving";
    this.isHopping = true;
  }

  /**
   * Update the frog's position and animations
   * @param delta - Time since last frame in seconds
   */
  update(delta: number): void {
    if (!this.isActive) return;

    // Check for new movement input
    if (this.state === "idle" || this.state === "hopping") {
      const direction = this.movementController.getNextDirection(
        this.gridPosition,
      );
      if (direction) {
        this.startMove(direction);
      }
    }

    // Update movement animation
    if (this.targetPosition) {
      this.moveProgress -= delta * 10; // Animation speed multiplier

      if (this.moveProgress <= 0) {
        // Move complete
        this.gridPosition = { ...this.targetPosition };
        this.pixelPosition = grid.gridToPixelCenter(this.gridPosition);
        this.targetPosition = null;
        this.moveProgress = 0;
        this.state = "idle";
        this.movementController.reset();
      }
    }

    // Update hop animation during movement
    if (this.isHopping) {
      this.hopScale += delta * 20 * this.hopDirection; // Hop speed

      // Reverse direction at limits
      if (this.hopScale >= 1.2) {
        this.hopDirection = -1;
      } else if (this.hopScale <= 0.8) {
        this.hopDirection = 1;
      }

      // Stop hopping when move is complete
      if (this.state === "idle") {
        this.isHopping = false;
        this.hopScale = 1.0;
      }
    }

    // Update sprite position
    this.updateSpritePosition();

    // Update sprite scale for hop animation
    this.sprite.scale.set(this.hopScale, this.hopScale);
  }

  /**
   * Update the sprite's pixel position based on grid position and movement state
   */
  private updateSpritePosition(): void {
    if (this.targetPosition && this.moveProgress > 0) {
      // Interpolate between current and target position
      const currentPixel = grid.gridToPixelCenter(this.gridPosition);
      const targetPixel = grid.gridToPixelCenter(this.targetPosition);

      const x =
        currentPixel.x +
        (targetPixel.x - currentPixel.x) * (1 - this.moveProgress);
      const y =
        currentPixel.y +
        (targetPixel.y - currentPixel.y) * (1 - this.moveProgress);

      this.container.position.set(x, y);
    } else {
      // Set to current grid position
      this.container.position.set(this.pixelPosition.x, this.pixelPosition.y);
    }
  }

  /**
   * Get the frog's collision bounds in pixel coordinates
   * @returns Bounds object with x, y, width, height
   */
  getCollisionBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const position = this.getPixelPosition();
    return {
      x: position.x + this.bounds.x,
      y: position.y + this.bounds.y,
      width: this.bounds.width,
      height: this.bounds.height,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.container.destroy({ children: true });
  }
}
