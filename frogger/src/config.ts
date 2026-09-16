// Game constants for Frogger (PixiJS v8)

/** Size of one grid tile in pixels. */
export const TILE_SIZE = 50;

/** Play field dimensions in tiles (columns x rows). */
export const GRID_COLS = 13;
export const GRID_ROWS = 15;

/** Frog speed in pixels per second. */
export const FROG_SPEED = 200;

/** Time limit (seconds) for each frog to reach a home slot. */
export const TIME_LIMIT = 30;

/** Lane types across the play field. */
export const LANE = {
  START: "start",
  TRAFFIC: "traffic",
  SAFE: "safe",
  WATER: "water",
  GOAL: "goal",
} as const;

export type LaneType = (typeof LANE)[keyof typeof LANE];

/** Horizontal travel direction: 1 = right, -1 = left. */
export type HorizontalDirection = 1 | -1;

export type VehicleType = "car" | "truck";
export type PlatformType = "log" | "turtle";

/** Named vehicle speed presets (px/s), from Appendix 12 of the rules. */
export const VEHICLE_SPEEDS = {
  slow: 60,
  medium: 100,
  "medium-fast": 140,
  fast: 180,
} as const;

/** Named platform (log/turtle) speed presets (px/s). */
export const PLATFORM_SPEEDS = {
  slow: 50,
  medium: 80,
  "medium-fast": 110,
  fast: 150,
} as const;

export interface TrafficLane {
  type: VehicleType;
  count: number;
  direction: HorizontalDirection;
  speed: number;
}

export interface PlatformSpec {
  type: PlatformType;
  /** Width of the platform in tiles. */
  width: number;
}

export interface WaterLane {
  direction: HorizontalDirection;
  speed: number;
  platforms: PlatformSpec[];
}

/** Default level-0 lane layout (traffic + water), from Appendix 12. */
export const LANE_CONFIG: {
  traffic: TrafficLane[];
  water: WaterLane[];
} = {
  traffic: [
    { type: "car", count: 2, direction: 1, speed: VEHICLE_SPEEDS.slow },
    { type: "truck", count: 3, direction: -1, speed: VEHICLE_SPEEDS.medium },
    {
      type: "car",
      count: 2,
      direction: 1,
      speed: VEHICLE_SPEEDS["medium-fast"],
    },
    { type: "car", count: 3, direction: -1, speed: VEHICLE_SPEEDS.fast },
  ],
  water: [
    {
      direction: 1,
      speed: PLATFORM_SPEEDS.slow,
      platforms: [
        { type: "log", width: 3 },
        { type: "log", width: 3 },
      ],
    },
    {
      direction: -1,
      speed: PLATFORM_SPEEDS.medium,
      platforms: [
        { type: "turtle", width: 1 },
        { type: "turtle", width: 1 },
        { type: "turtle", width: 1 },
      ],
    },
    {
      direction: 1,
      speed: PLATFORM_SPEEDS["medium-fast"],
      platforms: [
        { type: "log", width: 2 },
        { type: "turtle", width: 1 },
      ],
    },
    {
      direction: -1,
      speed: PLATFORM_SPEEDS.fast,
      platforms: [
        { type: "log", width: 1 },
        { type: "log", width: 1 },
      ],
    },
  ],
};
