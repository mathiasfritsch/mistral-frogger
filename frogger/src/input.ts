/**
 * Input System for Frogger
 * Grid-based movement with keyboard controls
 */

import { GridPosition, grid } from "./grid";

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
  private isMoving: boolean;
  private moveCooldown: number;
  private readonly MOVE_COOLDOWN_DURATION: number = 150; // ms between moves

  constructor() {
    this.keyManager = new KeyManager();
    this.isMoving = false;
    this.moveCooldown = 0;
  }

  /**
   * Try to get the next movement direction
   * Returns null if on cooldown or no movement key pressed
   */
  getNextDirection(currentPosition: GridPosition): GridPosition | null {
    // Check if we're on cooldown
    if (this.isMoving) {
      return null;
    }

    const direction = this.keyManager.getMovementDirection();
    if (!direction) {
      return null;
    }

    // Calculate target position
    const targetPosition: GridPosition = {
      x: currentPosition.x + direction.x,
      y: currentPosition.y + direction.y,
    };

    // Check if the move is valid (within grid bounds)
    if (!grid.isWithinBounds(targetPosition)) {
      return null;
    }

    // Start cooldown
    this.isMoving = true;
    this.moveCooldown = this.MOVE_COOLDOWN_DURATION;

    return direction;
  }

  /**
   * Update the movement controller (call this each frame)
   * @param delta - Time since last frame in seconds
   */
  update(delta: number): void {
    this.keyManager.update();

    // Update cooldown
    if (this.isMoving) {
      this.moveCooldown -= delta * 1000; // Convert to milliseconds
      if (this.moveCooldown <= 0) {
        this.isMoving = false;
      }
    }
  }

  /**
   * Force reset the movement cooldown (e.g., when frog dies)
   */
  reset(): void {
    this.isMoving = false;
    this.moveCooldown = 0;
  }

  /**
   * Check if currently in a move animation
   */
  isInMove(): boolean {
    return this.isMoving;
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
