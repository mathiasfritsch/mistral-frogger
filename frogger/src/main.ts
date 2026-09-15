/**
 * Frogger Game - Main Entry Point
 * Phase 2 Implementation: Game Entities
 *
 * This file demonstrates the integration of:
 * - Frog entity class
 * - Vehicle entity class
 * - Platform entity class
 * - HomeSlot entity class
 */

import { Application, Graphics, Container } from "pixi.js";
import { grid } from "./grid";
import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE, LANE_CONFIG } from "./config";
import { MovementController } from "./input";
import { Frog } from "./entities/frog";
import { Vehicle, createVehicle, type VehicleType } from "./entities/vehicle";
import {
  Platform,
  createPlatform,
  type PlatformType,
} from "./entities/platform";
import { HomeSlot, createHomeSlots } from "./entities/homeSlot";

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
  // ENTITY MANAGERS
  // ============================================

  // Input system
  const movementController = new MovementController();

  // Entities container (for easy management)
  const entitiesContainer = new Container();
  app.stage.addChild(entitiesContainer);

  // ============================================
  // FROG ENTITY
  // ============================================

  // Create the frog entity
  const frog = new Frog(movementController);
  entitiesContainer.addChild(frog.getContainer());

  // ============================================
  // HOME SLOTS
  // ============================================

  // Create home slots
  const homeSlots: HomeSlot[] = createHomeSlots(5);
  for (const slot of homeSlots) {
    entitiesContainer.addChild(slot.getContainer());
    // Randomly add bonuses to some slots
    if (Math.random() < 0.3) {
      slot.addFlyBonus();
    }
    if (Math.random() < 0.1) {
      slot.addAlligatorMouth();
    }
  }

  // ============================================
  // VEHICLES (Traffic Lanes)
  // ============================================

  const vehicles: Vehicle[] = [];

  // Create vehicles for traffic lanes
  for (let row = 0; row < grid.getDimensions().rows; row++) {
    const laneConfig = LANE_CONFIG[row];
    if (laneConfig.type !== "traffic") continue;

    // Create vehicles based on lane configuration
    for (const entityConfig of laneConfig.entities) {
      const vehicle = createVehicle(
        entityConfig.type as VehicleType,
        row,
        laneConfig.direction || "right",
        laneConfig.speed,
        entityConfig.width,
      );

      // Spawn at random positions
      const spawnX = Math.floor(Math.random() * grid.getDimensions().cols);
      vehicle.spawn(spawnX);

      vehicles.push(vehicle);
      entitiesContainer.addChild(vehicle.getContainer());
    }
  }

  // ============================================
  // PLATFORMS (Water Lanes)
  // ============================================

  const platforms: Platform[] = [];

  // Create platforms for water lanes
  for (let row = 0; row < grid.getDimensions().rows; row++) {
    const laneConfig = LANE_CONFIG[row];
    if (laneConfig.type !== "water") continue;

    // Create platforms based on lane configuration
    for (const entityConfig of laneConfig.entities) {
      const platform = createPlatform(
        entityConfig.type as PlatformType,
        row,
        laneConfig.direction || "right",
        laneConfig.speed,
        entityConfig.width,
      );

      // Spawn at random positions
      const spawnX = Math.floor(Math.random() * grid.getDimensions().cols);
      platform.spawn(spawnX);

      platforms.push(platform);
      entitiesContainer.addChild(platform.getContainer());
    }
  }

  // ============================================
  // GAME STATE
  // ============================================

  // Track game state
  let score = 0;
  let lives = 3;
  let frogsSaved = 0;

  // ============================================
  // COLLISION DETECTION
  // ============================================

  /**
   * Check if two bounds intersect
   */
  function checkBoundsCollision(
    bounds1: { x: number; y: number; width: number; height: number },
    bounds2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  // ============================================
  // GAME LOGIC HELPERS
  // ============================================

  /**
   * Check if the frog has reached a home slot
   */
  function checkHomeSlotReached(): void {
    const frogGridPos = frog.getGridPosition();

    for (const slot of homeSlots) {
      if (slot.isEmpty() && slot.containsPosition(frogGridPos)) {
        // Frog reached an empty home slot!
        slot.fill(frog);
        score += 10; // Base score
        frogsSaved++;

        // Check for adjacent empty slots for bonus
        const adjacentEmpty = homeSlots.filter(
          (s) =>
            s.isEmpty() &&
            Math.abs(s.getSlotIndex() - slot.getSlotIndex()) <= 1,
        ).length;
        score += adjacentEmpty * 10; // Bonus for adjacent empty slots

        // Reset frog after a delay
        setTimeout(() => {
          frog.reset();
          if (frogsSaved >= 5) {
            console.log("LEVEL COMPLETE! All 5 frogs saved!");
            // Reset all home slots for next level
            homeSlots.forEach((s) => s.clear());
            frogsSaved = 0;
          }
        }, 500);

        console.log(`Score: ${score}, Frogs Saved: ${frogsSaved}/5`);
        break;
      }
    }
  }

  /**
   * Check if the frog has collided with a vehicle
   */
  function checkVehicleCollision(): boolean {
    const frogBounds = frog.getCollisionBounds();

    for (const vehicle of vehicles) {
      if (!vehicle.isActiveVehicle()) continue;

      const vehicleBounds = vehicle.getCollisionBounds();
      if (checkBoundsCollision(frogBounds, vehicleBounds)) {
        // Collision detected!
        console.log(`Frog hit by ${vehicle.getType()}!`);
        lives--;
        if (lives <= 0) {
          console.log("GAME OVER!");
        } else {
          console.log(`${lives} lives remaining`);
        }
        frog.die();
        setTimeout(() => {
          frog.reset();
        }, 1000);
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the frog is in water without a platform
   */
  function checkWaterDanger(): boolean {
    const frogGridPos = frog.getGridPosition();

    // Check if frog is in water lane
    if (grid.isWaterLane(frogGridPos)) {
      // Check if frog is on a platform
      const frogBounds = frog.getCollisionBounds();
      let onPlatform = false;

      for (const platform of platforms) {
        if (!platform.isActivePlatform() || platform.getIsSubmerged()) continue;

        const platformBounds = platform.getCollisionBounds();
        if (checkBoundsCollision(frogBounds, platformBounds)) {
          onPlatform = true;
          break;
        }
      }

      // If in water but not on a platform, frog drowns
      if (!onPlatform) {
        console.log("Frog drowned!");
        lives--;
        if (lives <= 0) {
          console.log("GAME OVER!");
        } else {
          console.log(`${lives} lives remaining`);
        }
        frog.die();
        setTimeout(() => {
          frog.reset();
        }, 1000);
        return true;
      }
    }
    return false;
  }

  // ============================================
  // GAME LOOP
  // ============================================

  app.ticker.add((ticker) => {
    const delta: number = ticker.deltaTime;

    // Update input system
    movementController.update(delta);

    // Update frog
    frog.update(delta);

    // Update vehicles
    for (const vehicle of vehicles) {
      vehicle.update(delta);

      // Despawn and respawn vehicles that go off-screen
      const pixelPos = vehicle.getPixelPosition();
      if (pixelPos.x < -100 || pixelPos.x > SCREEN_WIDTH + 100) {
        // Off-screen: respawn on the other side
        const newX =
          vehicle.getDirection() === "right"
            ? 0
            : grid.getDimensions().cols - 1;
        vehicle.spawn(newX);
      }
    }

    // Update platforms
    for (const platform of platforms) {
      platform.update(delta);

      // Despawn and respawn platforms that go off-screen
      const pixelPos = platform.getPixelPosition();
      if (pixelPos.x < -100 || pixelPos.x > SCREEN_WIDTH + 100) {
        // Off-screen: respawn on the other side
        const newX =
          platform.getDirection() === "right"
            ? 0
            : grid.getDimensions().cols - 1;
        platform.spawn(newX);
      }
    }

    // Check for collisions and game events
    if (frog.isActiveFrog()) {
      checkHomeSlotReached();
      checkVehicleCollision();
      checkWaterDanger();
    }
  });

  // ============================================
  // CONSOLE LOGGING
  // ============================================

  console.log("=== Frogger Phase 2 ===");
  console.log(
    `Grid: ${grid.getDimensions().cols} cols x ${grid.getDimensions().rows} rows`,
  );
  console.log(`Tile Size: ${TILE_SIZE}px`);
  console.log(`Screen: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
  console.log(
    `Frog Start Position: (${grid.getFrogStartPosition().x}, ${grid.getFrogStartPosition().y})`,
  );
  console.log("\nControls: Arrow Keys or WASD to move one tile at a time");
  console.log("Goal: Reach the top row (goal lane) and land in home slots");
  console.log(`\nEntities:`);
  console.log(`- 1 Frog (green)`);
  console.log(`- ${vehicles.length} Vehicles in traffic lanes`);
  console.log(`- ${platforms.length} Platforms in water lanes`);
  console.log(`- ${homeSlots.length} Home slots at the top`);
  console.log("\nLane Types (from top to bottom):");

  for (let row = 0; row < grid.getDimensions().rows; row++) {
    const laneType = grid.getLaneType(row);
    const laneConfig = grid.getLaneDirection(row);
    const speed = grid.getLaneSpeed(row);
    console.log(
      `Row ${row}: ${laneType}${laneConfig ? ` (${laneConfig}, ${speed}px/s)` : ""}`,
    );
  }

  console.log("\nGame Rules:");
  console.log("- Hit by vehicle = lose a life");
  console.log("- In water without platform = lose a life");
  console.log("- Reach home slot = 10 points + bonus for adjacent empty slots");
  console.log("- Fill all 5 home slots = LEVEL COMPLETE!");
})();
