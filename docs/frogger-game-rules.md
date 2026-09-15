# Frogger — Game Rules Specification

This document defines **only the rules and gameplay mechanics** of Frogger for implementation in any game engine (e.g., PixiJS). It excludes technical architecture, performance targets, and engine-specific details.

---

## 1. Objective

Guide frogs from the starting area at the bottom of the screen to empty home slots at the top by crossing a busy road and a hazardous river. Fill all five home slots to advance to the next level.

---

## 2. Core Gameplay Loop

1. A frog spawns at the starting position.
2. The player moves the frog upward by hopping one tile at a time.
3. The frog must cross traffic lanes without touching vehicles.
4. The frog crosses a safe grass median.
5. The frog crosses water lanes by staying on moving platforms (logs, turtles, alligators).
6. The frog reaches an empty home slot at the top.
7. Repeat until all five home slots are filled or all lives are lost.

---

## 3. Controls & Movement

### 3.1 Input
- Supported inputs: keyboard arrows, gamepad D-pad/buttons, touch gestures (optional).
- Movement is restricted to four directions: up, down, left, right. No diagonal movement.

### 3.2 Grid-Based Hopping
- The play area is divided into a fixed grid of tiles.
- Each input moves the frog exactly one tile in the chosen direction.
- Movement is instant or accompanied by a short hop animation (does not affect collision timing).

---

## 4. Game Grid Layout

From bottom to top:

1. **Starting grass:** Spawn zone for frogs.
2. **Traffic lanes (4–5 lanes):** Vehicles move horizontally in alternating directions at varying speeds.
3. **Safe grass median:** A horizontal strip with no hazards.
4. **Water lanes (4–5 lanes):** Moving platforms (logs, turtles, alligators) drift horizontally.
5. **Goal row:** Five home slots where frogs must land.

---

## 5. Hazards & Collision Rules

### 5.1 Traffic Lanes
- Contact with any vehicle results in immediate loss of the current frog (life lost).

### 5.2 Water Lanes
- The frog must remain on a moving platform (log, turtle, or alligator).
- If the frog is in water without a platform, the frog drowns (life lost).
- If the frog is carried off the left or right edge of the screen while on water, the frog is lost.

### 5.3 Special Water Hazards
- **Diving turtles:** If the frog is on a turtle that submerges, the frog is lost.
- **Alligator mouths:** Some home slots may contain open alligator mouths; entering these may result in death or bonus points depending on variant rules.

---

## 6. Lives & Time Limit

### 6.1 Lives
- The player starts with a set number of frogs (e.g., 3).
- Losing a frog reduces the life count by one.
- The game ends when all lives are lost.

### 6.2 Time Limit
- Each frog has a time limit to reach a home slot (e.g., 30 seconds).
- A visual timer indicates remaining time.
- If time expires before reaching a home slot, the frog is lost.

---

## 7. Scoring Rules

### 7.1 Base Scoring
- Successfully reaching a home slot: **10 points**.
- Bonus points for each empty adjacent home slot (e.g., +10 to +80 points depending on configuration).
- Time bonus: Remaining time multiplied by a factor, added on successful crossing.

### 7.2 Bonus Opportunities
- **Flies:** Some home slots may contain flies; catching a fly awards bonus points (e.g., +100 to +200).
- **Lady frog:** Guiding a second frog to an adjacent home slot may award an escort bonus.

### 7.3 Extra Lives
- Award an extra frog at predefined score thresholds (e.g., every 10,000 points).

---

## 8. Level Progression

### 8.1 Advancing Levels
- A level is completed when all five home slots are filled with frogs.
- Upon completion, the next level begins with increased difficulty.

### 8.2 Difficulty Scaling
- Vehicle and platform speeds increase.
- Traffic density may increase.
- Platform availability on water may decrease.

---

## 9. Game States

- **Menu:** Start game, view high scores, adjust options.
- **Playing:** Active gameplay.
- **Paused:** Game paused (optional).
- **Game Over:** All lives lost; display final score.

---

## 10. Win & Lose Conditions

### 10.1 Win (Level Complete)
- All five home slots are filled with frogs.

### 10.2 Lose (Game Over)
- All lives are lost before completing the current level.

---

## 11. Optional Rules & Variants

- **Endless mode:** Continue indefinitely with increasing difficulty.
- **Custom lane configurations:** Different numbers of traffic/water lanes.
- **Modified scoring:** Adjust point values or disable bonuses.

---

## 12. Appendix: Sample Lane Configuration (Default Level 0)

### Traffic Lanes (4)
- **Lane 1:** 2 cars, moving right, slow speed.
- **Lane 2:** 3 trucks, moving left, medium speed.
- **Lane 3:** 2 cars, moving right, medium-fast speed.
- **Lane 4:** 3 cars, moving left, fast speed.

### Water Lanes (4)
- **Lane 1:** 2 long logs, moving right, slow speed.
- **Lane 2:** 3 turtles, moving left, medium speed.
- **Lane 3:** 1 log + 1 turtle, moving right, medium-fast speed.
- **Lane 4:** 2 short logs, moving left, fast speed.

---

*This specification covers all gameplay rules required to implement Frogger.*