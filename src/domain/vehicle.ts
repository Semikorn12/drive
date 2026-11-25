/**
 * Vehicle types. The MVP only records cars, but the data model already carries the field
 * so that motorcycle / bicycle modes can be added later without a migration of old trips.
 */
export type VehicleType = 'car' | 'motorcycle' | 'bicycle';
export const DEFAULT_VEHICLE_TYPE: VehicleType = 'car';
