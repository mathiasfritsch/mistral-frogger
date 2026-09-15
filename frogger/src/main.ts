/**
 * Frogger Game - Main Entry Point
 * Phase 1 Implementation: Grid System, Config, and Input
 *
 * This file demonstrates the integration of:
 * - Config system with game constants
 * - Grid system with lane types
 * - Input system with grid-based movement
 */

import { Application, Graphics } from "pixi.js";
import { grid, GridPosition } from "./grid";
import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE } from "./config";
import { MovementController } from "./input";

// ============================================
// GAME INITIALIZATION
// ============================================

(async () => {
  // Create PixiJS application with fixed size based on grid
  const app = new Application();
  await app.init({
    background: "#1099bb",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeTo: window,
  });

  // Append canvas to container
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // ============================================
  // GRID VISUALIZATION
  // ============================================

  // Draw the game grid for debugging/visualization
  const gridContainer = new Graphics();

  // Draw grid lines
  for (let col = 0; col <= grid.getDimensions().cols; col++) {
    gridContainer
      .lineStyle(1, 0x444444, 0.3)
      .moveTo(col * TILE_SIZE, 0)
      .lineTo(col * TILE_SIZE, SCREEN_HEIGHT);
  }

  for (let row = 0; row <= grid.getDimensions().rows; row++) {
    gridContainer
      .lineStyle(1, 0x444444, 0.3)
      .moveTo(0, row * TILE_SIZE)
      .lineTo(SCREEN_WIDTH, row * TILE_SIZE);
  }

  app.stage.addChild(gridContainer);

  // ============================================
  // LANE VISUALIZATION
  // ============================================

  // Draw colored backgrounds for different lane types
  const laneBackgrounds = new Graphics();

  for (let row = 0; row < grid.getDimensions().rows; row++) {
    const laneType = grid.getLaneType(row);
    let color = 0x000000;
    let alpha = 0.15;

    switch (laneType) {
      case "start":
        color = 0x006600; // Dark green
        alpha = 0.3;
        break;
      case "traffic":
        color = 0x333333; // Dark gray (road)
        alpha = 0.3;
        break;
      case "safe":
        color = 0x006600; // Dark green (median)
        alpha = 0.3;
        break;
      case "water":
        color = 0x0066ff; // Blue (water)
        alpha = 0.3;
        break;
      case "goal":
        color = 0x003300; // Very dark green (goal area)
        alpha = 0.3;
        break;
    }

    laneBackgrounds
      .beginFill(color, alpha)
      .drawRect(0, row * TILE_SIZE, SCREEN_WIDTH, TILE_SIZE)
      .endFill();
  }

  app.stage.addChild(laneBackgrounds);

  // ============================================
  // HOME SLOTS VISUALIZATION
  // ============================================

  const homeSlots = grid.getHomeSlotPositions(5);
  const homeSlotGraphics = new Graphics();

  for (const slot of homeSlots) {
    homeSlotGraphics
      .lineStyle(2, 0xffffff)
      .drawRect(
        slot.x * TILE_SIZE + 2,
        slot.y * TILE_SIZE + 2,
        TILE_SIZE - 4,
        TILE_SIZE - 4,
      );
  }

  app.stage.addChild(homeSlotGraphics);

  // ============================================
  // FROG
  // ============================================

  // Create frog using Graphics API
  const frog = new Graphics()
    .circle(0, 0, TILE_SIZE / 2 - 5) // Slightly smaller than tile
    .fill(0x00ff00) // Green
    .circle(-8, -5, 3) // Left eye
    .circle(8, -5, 3) // Right eye
    .fill(0xffffff) // White eyes
    .circle(-8, -5, 1) // Left pupil
    .circle(8, -5, 1) // Right pupil
    .fill(0x000000); // Black pupils

  // Set frog pivot to center
  frog.pivot.set(TILE_SIZE / 2, TILE_SIZE / 2);

  // Start frog at the default starting position
  let frogPosition: GridPosition = grid.getFrogStartPosition();
  let frogTargetPosition: GridPosition | null = null;
  let frogMoveProgress: number = 0;

  // Initial position
  updateFrogPosition();

  app.stage.addChild(frog);

  // ============================================
  // INPUT SYSTEM
  // ============================================

  const movementController = new MovementController();

  // ============================================
  // MOVEMENT LOGIC
  // ============================================

  /**
   * Update frog's pixel position based on grid position and movement state
   */
  function updateFrogPosition(): void {
    // Calculate base position (center of grid cell)
    const basePixel = grid.gridToPixelCenter(frogPosition);

    // If moving, interpolate between current and target
    if (frogTargetPosition && frogMoveProgress > 0) {
      const targetPixel = grid.gridToPixelCenter(frogTargetPosition);
      const currentPixel = grid.gridToPixelCenter(frogPosition);

      const x =
        currentPixel.x +
        (targetPixel.x - currentPixel.x) * (1 - frogMoveProgress);
      const y =
        currentPixel.y +
        (targetPixel.y - currentPixel.y) * (1 - frogMoveProgress);

      frog.position.set(x, y);
    } else {
      // Not moving, just set to current position
      frog.position.set(basePixel.x, basePixel.y);
    }
  }

  /**
   * Start a move animation to a new grid position
   */
  function startMove(direction: GridPosition): void {
    frogTargetPosition = {
      x: frogPosition.x + direction.x,
      y: frogPosition.y + direction.y,
    };
    frogMoveProgress = 1.0; // Start at full progress (beginning of animation)
  }

  /**
   * Complete the move animation
   */
  function completeMove(): void {
    if (frogTargetPosition) {
      frogPosition = { ...frogTargetPosition };
      frogTargetPosition = null;
      frogMoveProgress = 0;
      movementController.reset();
    }
  }

  // ============================================
  // GAME LOOP
  // ============================================

  app.ticker.add((ticker) => {
    // In PixiJS v8, ticker.deltaTime is the time since last frame
    const delta: number = ticker.deltaTime;

    // Update input system
    movementController.update(delta);

    // Check for new movement direction
    if (!frogTargetPosition) {
      const direction = movementController.getNextDirection(frogPosition);
      if (direction) {
        startMove(direction);
      }
    }

    // Update move animation
    if (frogTargetPosition) {
      frogMoveProgress -= delta * 5; // Adjust speed of animation (5 = multiplier)

      if (frogMoveProgress <= 0) {
        completeMove();
      }
    }

    // Update frog position
    updateFrogPosition();
  });

  // ============================================
  // CONSOLE LOGGING
  // ============================================

  console.log("=== Frogger Phase 1 ===");
  console.log(
    `Grid: ${grid.getDimensions().cols} cols x ${grid.getDimensions().rows} rows`,
  );
  console.log(`Tile Size: ${TILE_SIZE}px`);
  console.log(`Screen: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
  console.log(
    `Frog Start Position: (${grid.getFrogStartPosition().x}, ${grid.getFrogStartPosition().y})`,
  );
  console.log("Home Slots:", grid.getHomeSlotPositions(5));
  console.log("\nControls: Arrow Keys or WASD to move one tile at a time");
  console.log("Goal: Reach the top row (goal lane)");
  console.log("\nLane Types (from top to bottom):");

  for (let row = 0; row < grid.getDimensions().rows; row++) {
    const laneType = grid.getLaneType(row);
    const laneConfig = grid.getLaneDirection(row);
    const speed = grid.getLaneSpeed(row);
    console.log(
      `Row ${row}: ${laneType}${laneConfig ? ` (${laneConfig}, ${speed}px/s)` : ""}`,
    );
  }
})();
