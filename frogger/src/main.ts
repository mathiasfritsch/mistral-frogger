import { Application, Container, Graphics, Text } from "pixi.js";
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from "./config";
import { getLaneType, gridToPixel, HOME_SLOT_COLS, LANE_COLORS } from "./grid";
import { KeyManager } from "./input";
import { Frog } from "./entities/frog";
import { Fly } from "./entities/fly";
import { HomeSlot } from "./entities/homeSlot";
import { LaneManager } from "./lanes";
import { Level } from "./level";
import { CollisionSystem } from "./collision";
import { resolveWater } from "./waterLogic";
import { Game } from "./game";
import { FrogTimer } from "./timer";
import { ScoreManager } from "./score";
import { LivesUI } from "./ui";

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
  const startX = Math.floor(GRID_COLS / 2);
  const startY = GRID_ROWS - 1;
  const frog = new Frog(startX, startY);
  app.stage.addChild(frog);

  // Phase 4.3 — Lives and respawn handling.
  const game = new Game(frog, startX, startY);

  // Phase 4.4 — Per-frog countdown timer, top-right corner.
  const timer = new FrogTimer();
  timer.display.x = GRID_COLS * TILE_SIZE - 60;
  timer.display.y = 10;
  app.stage.addChild(timer.display);

  // Phase 5.1 / 5.3 — Scoring and extra lives.
  const score = new ScoreManager();
  const scoreText = new Text({
    text: "0",
    style: { fontSize: 24, fill: 0xffffff },
  });
  scoreText.x = (GRID_COLS * TILE_SIZE) / 2 - 30;
  scoreText.y = 10;
  app.stage.addChild(scoreText);

  // Phase 5.4 — Remaining lives in the top-left corner.
  const livesUI = new LivesUI();
  livesUI.setLives(game.lives);
  app.stage.addChild(livesUI);

  // Phase 5.2 — Bonus flies in a couple of random home slots.
  const flies: Fly[] = [];
  const spawnFlies = (): void => {
    const candidates = Array.from(HOME_SLOT_COLS.keys());
    candidates.sort(() => Math.random() - 0.5);
    for (const slotIndex of candidates.slice(0, 2)) {
      const fly = new Fly(slotIndex, 100 + Math.floor(Math.random() * 101));
      const { x, y } = gridToPixel(HOME_SLOT_COLS[slotIndex], 0);
      fly.x = x + TILE_SIZE / 2;
      fly.y = y + TILE_SIZE / 2;
      flies.push(fly);
      app.stage.addChild(fly);
    }
  };
  spawnFlies();

  const keys = new KeyManager();
  const screenWidth = GRID_COLS * TILE_SIZE;
  let diedThisFrame = false;
  let levelComplete = false;

  const die = (): void => {
    if (diedThisFrame || game.gameOver) return;
    diedThisFrame = true;
    game.killFrog();
    if (!game.gameOver) {
      timer.reset();
      livesUI.setLives(game.lives);
    }
  };

  const grantExtraLives = (count: number): void => {
    for (let i = 0; i < count; i++) game.addLife();
    livesUI.setLives(game.lives);
  };

  const countEmptyAdjacent = (slotIndex: number): number => {
    let count = 0;
    if (slotIndex > 0 && !level.slots[slotIndex - 1]) count += 1;
    if (slotIndex < level.slots.length - 1 && !level.slots[slotIndex + 1]) {
      count += 1;
    }
    return count;
  };

  const handleGoal = (): void => {
    const slotIndex = HOME_SLOT_COLS.indexOf(frog.gridX);

    // Landed on the wall between slots, or on an occupied slot.
    if (slotIndex === -1 || level.slots[slotIndex]) {
      die();
      return;
    }

    // Landed in an empty slot.
    level.fillSlot(slotIndex);
    homeSlots[slotIndex].fillSlot();

    let extraLives = score.scoreHomeSlot(
      countEmptyAdjacent(slotIndex),
      timer.secondsLeft,
    ).extraLives;

    const fly = flies.find((candidate) => candidate.slotIndex === slotIndex);
    if (fly) {
      extraLives += score.scoreBonus(fly.bonus).extraLives;
      app.stage.removeChild(fly);
      fly.destroy();
      flies.splice(flies.indexOf(fly), 1);
    }

    grantExtraLives(extraLives);
    scoreText.text = score.score.toString();

    if (level.isComplete) {
      levelComplete = true;
      frog.state = "safe";
      return;
    }

    game.respawn();
    timer.reset();
  };

  app.ticker.add((ticker) => {
    // Frame-independent updates use seconds.
    const deltaSeconds = ticker.deltaMS / 1000;
    diedThisFrame = false;

    if (game.gameOver || levelComplete) return;

    lanes.update(deltaSeconds);
    timer.update(deltaSeconds);

    // Grid-based hopping: one tile per fresh keypress, no diagonals.
    const direction = keys.consumeDirection();
    if (direction) frog.hop(direction);

    // Phase 5 — Reaching the goal row.
    if (frog.gridY === 0) {
      handleGoal();
      if (diedThisFrame || levelComplete) return;
    }

    // Phase 4.1 — Vehicle collision.
    for (const vehicle of lanes.vehicles) {
      if (CollisionSystem.checkCollision(frog, vehicle)) {
        die();
        break;
      }
    }

    // Phase 4.2 — Water logic (drowning / riding platforms).
    if (!diedThisFrame) {
      const outcome = resolveWater(
        frog,
        lanes.platforms,
        screenWidth,
        deltaSeconds,
      );
      if (outcome === "drowned" || outcome === "carried-off") die();
    }

    // Phase 4.4 — Timer expiry.
    if (!diedThisFrame && timer.expired) die();
  });
})();
