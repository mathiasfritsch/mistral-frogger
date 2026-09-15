import { Application, Graphics } from 'pixi.js';

(async () => {
  // Create the PixiJS application
  const app = new Application();

  await app.init({
    background: '#1099bb',
    resizeTo: window,
  });

  // Add the canvas to the page
  const container = document.querySelector<HTMLDivElement>('#pixi-container');
  container?.appendChild(app.canvas);

  // Create a basic square
  const square = new Graphics()
    .rect(200, 150, 100, 100)
    .fill(0xffffff);

  // Center it on the stage
  square.x = app.screen.width / 2 - 50;
  square.y = app.screen.height / 2 - 50;

  app.stage.addChild(square);
})();
