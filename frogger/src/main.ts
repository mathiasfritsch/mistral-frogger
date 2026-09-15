import { Application, Assets, Sprite, Graphics } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Create a frog using Graphics with transparency (PixiJS v8+ chaining API)
  const frog = new Graphics()
    .circle(0, 0, 25)       // Body: 50px diameter
    .fill(0x00FF00)        // Green
    .circle(-10, -8, 5)    // Left eye
    .circle(10, -8, 5)     // Right eye
    .fill(0xFFFFFF)        // White eyes
    .circle(-10, -8, 2)    // Left pupil
    .circle(10, -8, 2)     // Right pupil
    .fill(0x000000);       // Black pupils

  // Set pivot to center for rotation/positioning
  frog.pivot.set(0, 0);

  // Move the frog to the center of the screen
  frog.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the frog to the stage
  app.stage.addChild(frog);

  // Keyboard state for steering (WASD + Arrow keys)
  const keys: Record<string, boolean> = {};
  const speed = 200; // pixels per second

  window.addEventListener("keydown", (e) => keys[e.key] = true);
  window.addEventListener("keyup", (e) => keys[e.key] = false);

  // Listen for animate update - steering with WASD and arrows
  app.ticker.add((delta) => {
    // Reset velocity
    let vx = 0;
    let vy = 0;

    // WASD keys
    if (keys["w"] || keys["ArrowUp"]) vy -= speed * 0.03;
    if (keys["s"] || keys["ArrowDown"]) vy += speed * 0.03;
    if (keys["a"] || keys["ArrowLeft"]) vx -= speed * 0.03;
    if (keys["d"] || keys["ArrowRight"]) vx += speed * 0.03
    // Apply movement
    frog.x += vx;
    frog.y += vy;

    // Keep frog within screen bounds (account for 25px radius)
    const radius = 25;
    frog.x = Math.max(radius, Math.min(frog.x, app.canvas.width - radius));
    frog.y = Math.max(radius, Math.min(frog.y, app.canvas.height - radius));
  });
})();
