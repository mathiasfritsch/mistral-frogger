/**
 * Entity Exports
 * Centralized exports for all game entities
 */

export { Frog, type FrogState } from "./frog";
export { Vehicle, createVehicle, type VehicleType } from "./vehicle";
export {
  Platform,
  createPlatform,
  type PlatformType,
  type TurtleState,
  type AlligatorState,
} from "./platform";
export {
  HomeSlot,
  createHomeSlot,
  createHomeSlots,
  type HomeSlotState,
} from "./homeSlot";
