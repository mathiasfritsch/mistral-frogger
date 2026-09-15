/**
 * HomeSlot Entity for Frogger Game
 * Represents the goal slots at the top of the screen where frogs must land
 */

import { Graphics, Container } from "pixi.js";
import { TILE_SIZE } from "../config";
import { GridPosition, PixelPosition, grid } from "../grid";
import { Frog } from "./frog";

// ============================================
// HOME SLOT STATES
// ============================================

/**
 * Possible states for a home slot
 */
export type HomeSlotState = "empty" | "filled" | "fly" | "alligator_mouth";

// ============================================
// HOME SLOT CONFIGURATION
// ============================================

const HOME_SLOT_COLOR = 0x006600; // Dark green
const HOME_SLOT_FILLED_COLOR = 0x00aa00; // Brighter green when filled
const HOME_SLOT_HIGHLIGHT_COLOR = 0xffffff; // White highlight
const HOME_SLOT_SIZE = TILE_SIZE * 0.8; // Slightly smaller than tile

// ============================================
// HOME SLOT CLASS
// ============================================

/**
 * Represents a home slot where frogs must land to score points
 */
export class HomeSlot {
  // Visual representation
  private background: Graphics;
  private highlight: Graphics;
  private bonusSprite: Graphics | null;
  private container: Container;

  // Position and properties
  private gridPosition: GridPosition;
  private pixelPosition: PixelPosition;
  private slotIndex: number;

  // State
  private state: HomeSlotState;
  private isOccupied: boolean;
  private hasFly: boolean;
  private hasAlligatorMouth: boolean;

  // Frog reference (if a frog is in this slot)
  private frog: Frog | null;

  /**
   * Create a new home slot
   * @param slotIndex - Index of this slot (0-4)
   */
  constructor(slotIndex: number = 0) {
    // Initialize container
    this.container = new Container();
    this.slotIndex = slotIndex;

    // Get position for this slot
    const homeSlots = grid.getHomeSlotPositions(5);
    this.gridPosition = homeSlots[slotIndex] || { x: 0, y: 0 };
    this.pixelPosition = grid.gridToPixelCenter(this.gridPosition);

    // Initialize state
    this.state = "empty";
    this.isOccupied = false;
    this.hasFly = false;
    this.hasAlligatorMouth = false;
    this.frog = null;

    // Create background
    this.background = new Graphics();
    this.createBackground();
    this.container.addChild(this.background);

    // Create highlight border
    this.highlight = new Graphics();
    this.createHighlight();
    this.container.addChild(this.highlight);

    // Initialize bonus sprites
    this.bonusSprite = null;

    // Position container
    this.container.position.set(this.pixelPosition.x, this.pixelPosition.y);
  }

  /**
   * Create the home slot background
   */
  private createBackground(): void {
    this.background.clear();

    const color =
      this.state === "filled" ? HOME_SLOT_FILLED_COLOR : HOME_SLOT_COLOR;

    this.background
      .rect(
        -HOME_SLOT_SIZE / 2,
        -HOME_SLOT_SIZE / 2,
        HOME_SLOT_SIZE,
        HOME_SLOT_SIZE,
      )
      .fill(color);
  }

  /**
   * Create the home slot highlight border
   */
  private createHighlight(): void {
    this.highlight.clear();

    // Draw white border
    this.highlight
      .lineStyle(2, HOME_SLOT_HIGHLIGHT_COLOR)
      .rect(
        -HOME_SLOT_SIZE / 2 + 2,
        -HOME_SLOT_SIZE / 2 + 2,
        HOME_SLOT_SIZE - 4,
        HOME_SLOT_SIZE - 4,
      );
  }

  /**
   * Create a fly bonus sprite
   */
  private createFlySprite(): void {
    if (this.bonusSprite) {
      this.container.removeChild(this.bonusSprite);
    }

    this.bonusSprite = new Graphics();
    this.bonusSprite
      .circle(0, 0, 4)
      .fill(0xff0000) // Red fly
      .circle(-2, -2, 1)
      .circle(2, -2, 1)
      .fill(0x000000); // Eyes

    this.container.addChild(this.bonusSprite);
  }

  /**
   * Create an alligator mouth sprite
   */
  private createAlligatorMouthSprite(): void {
    if (this.bonusSprite) {
      this.container.removeChild(this.bonusSprite);
    }

    this.bonusSprite = new Graphics();
    const mouthWidth = HOME_SLOT_SIZE * 0.6;
    const mouthHeight = HOME_SLOT_SIZE * 0.4;

    // Alligator mouth (open)
    this.bonusSprite
      .ellipse(0, 0, mouthWidth / 2, mouthHeight / 2)
      .fill(0x228b22) // Dark green
      .ellipse(0, 0, mouthWidth / 3, mouthHeight / 3)
      .fill(0xff0000); // Red mouth interior

    // Teeth
    this.bonusSprite
      .lineStyle(1, 0xffffff)
      .moveTo(-10, -5)
      .lineTo(-8, -5)
      .moveTo(-6, -5)
      .lineTo(-4, -5)
      .moveTo(-2, -5)
      .lineTo(0, -5)
      .moveTo(2, -5)
      .lineTo(4, -5)
      .moveTo(6, -5)
      .lineTo(8, -5)
      .moveTo(10, -5)
      .lineTo(12, -5);

    this.container.addChild(this.bonusSprite);
  }

  /**
   * Get the home slot's container (for adding to stage)
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get the home slot's grid position
   */
  getGridPosition(): GridPosition {
    return { ...this.gridPosition };
  }

  /**
   * Get the home slot's pixel position
   */
  getPixelPosition(): PixelPosition {
    return { ...this.pixelPosition };
  }

  /**
   * Get the home slot's index (0-4)
   */
  getSlotIndex(): number {
    return this.slotIndex;
  }

  /**
   * Get the current state of the home slot
   */
  getState(): HomeSlotState {
    return this.state;
  }

  /**
   * Check if the home slot is occupied by a frog
   */
  getIsOccupied(): boolean {
    return this.isOccupied;
  }

  /**
   * Check if the home slot is empty
   */
  isEmpty(): boolean {
    return this.state === "empty";
  }

  /**
   * Check if the home slot has a fly bonus
   */
  getHasFlyBonus(): boolean {
    return this.hasFly;
  }

  /**
   * Check if the home slot has an alligator mouth
   */
  getHasAlligatorMouth(): boolean {
    return this.hasAlligatorMouth;
  }

  /**
   * Set the home slot state
   * @param state - New state for the slot
   */
  setState(state: HomeSlotState): void {
    this.state = state;
    this.updateVisuals();
  }

  /**
   * Set the home slot to filled (with a frog)
   * @param frog - The frog that filled this slot
   */
  fill(frog: Frog): void {
    this.state = "filled";
    this.isOccupied = true;
    this.frog = frog;
    this.hasFly = false;
    this.hasAlligatorMouth = false;
    this.updateVisuals();
  }

  /**
   * Add a fly bonus to this home slot
   */
  addFlyBonus(): void {
    if (this.state !== "empty") return;
    this.hasFly = true;
    this.state = "fly";
    this.createFlySprite();
  }

  /**
   * Add an alligator mouth to this home slot
   */
  addAlligatorMouth(): void {
    if (this.state !== "empty") return;
    this.hasAlligatorMouth = true;
    this.state = "alligator_mouth";
    this.createAlligatorMouthSprite();
  }

  /**
   * Clear the home slot (reset to empty)
   */
  clear(): void {
    this.state = "empty";
    this.isOccupied = false;
    this.frog = null;
    this.hasFly = false;
    this.hasAlligatorMouth = false;

    if (this.bonusSprite) {
      this.container.removeChild(this.bonusSprite);
      this.bonusSprite = null;
    }

    this.updateVisuals();
  }

  /**
   * Get the frog occupying this slot (if any)
   */
  getFrog(): Frog | null {
    return this.frog;
  }

  /**
   * Update visual representation based on state
   */
  private updateVisuals(): void {
    this.createBackground();

    // Remove any existing bonus sprite
    if (this.bonusSprite) {
      this.container.removeChild(this.bonusSprite);
      this.bonusSprite = null;
    }

    // Add appropriate visuals based on state
    if (this.state === "fly") {
      this.createFlySprite();
    } else if (this.state === "alligator_mouth") {
      this.createAlligatorMouthSprite();
    }
  }

  /**
   * Check if a grid position is inside this home slot
   * @param position - Grid position to check
   */
  containsPosition(position: GridPosition): boolean {
    return (
      position.x === this.gridPosition.x && position.y === this.gridPosition.y
    );
  }

  /**
   * Get collision bounds for this home slot
   */
  getCollisionBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: this.pixelPosition.x - HOME_SLOT_SIZE / 2,
      y: this.pixelPosition.y - HOME_SLOT_SIZE / 2,
      width: HOME_SLOT_SIZE,
      height: HOME_SLOT_SIZE,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.container.destroy({ children: true });
  }
}

// ============================================
// HOME SLOT FACTORY AND MANAGER
// ============================================

/**
 * Create a home slot at a specific index
 * @param slotIndex - Index of the slot (0-4)
 * @returns New HomeSlot instance
 */
export function createHomeSlot(slotIndex: number = 0): HomeSlot {
  return new HomeSlot(slotIndex);
}

/**
 * Create all home slots (typically 5)
 * @param count - Number of home slots to create
 * @returns Array of HomeSlot instances
 */
export function createHomeSlots(count: number = 5): HomeSlot[] {
  const slots: HomeSlot[] = [];
  for (let i = 0; i < count; i++) {
    slots.push(new HomeSlot(i));
  }
  return slots;
}
