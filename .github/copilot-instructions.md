# Copilot Instructions for this repository

説明は日本語で表示するようにして。

## Project overview

This repository is a small browser game built as a static HTML/CSS/JavaScript app. There is no framework, build pipeline, or package manager configuration in the repo.

- `index.html` defines the page structure, canvas, HUD, and game overlay.
- `style.css` handles the dark interface, responsive layout, and touch controls.
- `game.js` contains the entire game logic: movement, physics, collision detection, coin collection, win/lose states, and rendering.
- The project is a Japanese-language mini platformer commonly described as a side-scrolling action game.

## Build, test, and lint commands

There are currently no build scripts, test files, or lint configuration files in this repository.

- No `package.json` exists, so there is no `npm test`, `npm run build`, or `npm run lint` command to run.
- No single-test command exists because there are no automated tests in the repo.
- For local smoke testing, run a static server from the repository root:

  ```bash
  cd /workspaces/my-first-app
  python3 -m http.server 8000
  ```

- Then open `http://localhost:8000` in a browser. For a quick HTTP check from the terminal:

  ```bash
  curl -I http://localhost:8000
  ```

## High-level architecture

This project is intentionally simple and centered around a single game loop.

- The page bootstraps a canvas-based game in `game.js` and attaches DOM references for the HUD and start/restart overlay.
- Global constants define the world size, gravity, movement speed, and level layout (`platforms`, `coinSpots`, `WORLD_WIDTH`).
- The `player` object stores position, dimensions, velocity, and grounded state.
- The `update()` function handles keyboard/touch input, horizontal movement, jumping, platform collisions, coin pickup, and win/lose checks.
- The `draw()` pipeline renders the sky, parallax clouds, scenery, platforms, coins, goal flag, and player each animation frame.
- `gameLoop()` schedules the next frame with `requestAnimationFrame(...)`, so the project is a classic canvas animation loop rather than a component framework.

## Key conventions

- Keep the project as a no-build static site unless the repo later adds tooling. Avoid introducing a framework or bundler for common changes.
- Match the existing JavaScript style: top-level constants, direct DOM selectors, and simple function-based state management rather than classes or modules.
- Preserve the existing DOM IDs and CSS class names (`#game`, `#coin-count`, `#game-message`, `#start-button`, `#restart-button`, `.control-button`) when making UI changes.
- The game uses a single shared global state model (`player`, `coins`, `cameraX`, `collected`, `playing`) and resets via `resetGame()`. Changes that affect start/restart behavior should keep the overlay and status text aligned.
- The interface text is intentionally Japanese and the game includes keyboard/touch controls for movement and jumping. Keep labels, messages, and accessibility attributes consistent with the current UX.
- Level data (`platforms`, `coinSpots`) is part of the gameplay definition; when adjusting level geometry or goal placement, update the corresponding coordinates and reset logic together.

## Repository notes

- `README.md` is currently a placeholder and does not contain project-specific setup, architecture, or contribution guidance.
- There is no additional AI instruction file, contributor guide, or project config in this repository to supplement the project instructions above.
