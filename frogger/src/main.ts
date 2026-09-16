import { Application, Container, Graphics } from "pixi.js";
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from "./config";
import { getLaneType, gridToPixel, HOME_SLOT_COLS, LANE_COLORS } from "./grid";
import { KeyManager } from "./input";
import { Frog } from "./entities/frog";
import { HomeSlot } from "./entities/homeSlot";
import { LaneManager } from "./lanes";
import { Level } from "./level";

(async () => {
  const app = new Application();
  await app.init({
    background: "#000000",
    width: GRID_COLS * TILE_SIZE,
    height: GRID_ROWS * TILE_SIZE,
  });

  const container = document.querySelector<HTMLDivElement>("#pixi-container");
  container?.appendChild(app.canvas);

  // Render the tile grid, colored by lane type.
  const grid = new Container();
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const { x, y } = gridToPixel(col, row);
      const tile = new Graphics()
        .rect(x, y, TILE_SIZE, TILE_SIZE)
        .fill(LANE_COLORS[getLaneType(row)]);
      grid.addChild(tile);
    }
  }
  app.stage.addChild(grid);

  // Phase 2.4 — Render the five home slots in the goal row.
  const homeSlots = HOME_SLOT_COLS.map((column) => new HomeSlot(column));
  homeSlots.forEach((slot) => app.stage.addChild(slot));

  // Phase 3 — Lane and level system.
  const level = new Level(1);
  const lanes = new LaneManager(level.laneConfig);
  app.stage.addChild(lanes);

  // Phase 2.1 — The frog starts on the bottom grass row, centered.
  const frog = new Frog(Math.floor(GRID_COLS / 2), GRID_ROWS - 1);
  app.stage.addChild(frog);

  const keys = new KeyManager();

  app.ticker.add((ticker) => {
    // Frame-independent updates use seconds.
    const deltaSeconds = ticker.deltaMS / 1000;
    lanes.update(deltaSeconds);

    // Grid-based hopping: one tile per fresh keypress, no diagonals.
    const direction = keys.consumeDirection();
    if (!direction) return;
    frog.hop(direction);
  });
})();
