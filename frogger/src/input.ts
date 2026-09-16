/**
 * Input System for Frogger
 * Grid-based movement with keyboard controls
 */

import { GridPosition } from "./grid";

// ============================================
// KEY STATE MANAGER
// ============================================

/**
 * Manages keyboard input state with debouncing for grid-based movement
 */
export class KeyManager {
  private keys: Record<string, boolean>;
  private lastKeyState: Record<string, boolean>;
  private keyBuffer: string[];

  // Movement keys mapping
  private moveKeys: Record<string, GridPosition> = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  constructor() {
    this.keys = {};
    this.lastKeyState = {};
    this.keyBuffer = [];

    // Initialize event listeners
    this.setupEventListeners();
  }

  /**
   * Set up keyboard event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
      // Clear any buffered key on release
      this.keyBuffer = this.keyBuffer.filter((key) => key !== e.key);
    });
  }

  /**
   * Get the grid movement direction from pressed keys
   * Returns only one direction at a time (priority: last pressed)
   */
  getMovementDirection(): GridPosition | null {
    // Check movement keys in priority order
    const priorityOrder = [
      "ArrowUp",
      "w",
      "ArrowDown",
      "s",
      "ArrowLeft",
      "a",
      "ArrowRight",
      "d",
    ];

    for (const key of priorityOrder) {
      if (this.keys[key]) {
        return this.moveKeys[key];
      }
    }

    return null;
  }

  /**
   * Check if a specific key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys[key] || false;
  }

  /**
   * Get all currently pressed movement keys
   */
  getPressedMovementKeys(): string[] {
    return Object.keys(this.keys).filter(
      (key) => this.keys[key] && this.moveKeys[key],
    );
  }

  /**
   * Update key state (call this at the start of each frame)
   * Handles debouncing to prevent repeated movement from held keys
   */
  update(): void {
    // Store current state for comparison next frame
    this.lastKeyState = { ...this.keys };
  }

  /**
   * Check if a key was just pressed (not held)
   */
  wasKeyJustPressed(key: string): boolean {
    return this.keys[key] && !this.lastKeyState[key];
  }

  /**
   * Reset the input system
   */
  reset(): void {
    this.keys = {};
    this.lastKeyState = {};
    this.keyBuffer = [];
  }

  /**
   * Destroy event listeners
   */
  destroy(): void {
    // Remove event listeners
    window.removeEventListener("keydown", () => {});
    window.removeEventListener("keyup", () => {});
  }
}

// ============================================
// MOVEMENT CONTROLLER
// ============================================

/**
 * Handles frog movement based on input
 */
export class MovementController {
  private keyManager: KeyManager;

  constructor() {
    this.keyManager = new KeyManager();
  }

  /**
   * Get the current movement direction from keyboard input
   * Returns the direction if a movement key is pressed, null otherwise
   */
  getDirection(): GridPosition | null {
    return this.keyManager.getMovementDirection();
  }

  /**
   * Update the movement controller (call this each frame)
   */
  update(): void {
    this.keyManager.update();
  }

  /**
   * Reset the movement controller
   */
  reset(): void {
    // Nothing to reset - cooldown is handled by the Frog
  }

  /**
   * Get the key manager for additional input checks
   */
  getKeyManager(): KeyManager {
    return this.keyManager;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.keyManager.destroy();
  }
}

// ============================================
// SINGLETON INSTANCES
// ============================================

// Export singleton instances for easy access
export const keyManager = new KeyManager();
export const movementController = new MovementController();
