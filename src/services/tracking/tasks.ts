/**
 * Background task definitions. MUST be imported at module scope before the app renders
 * (see src/app/_layout.tsx), because iOS may launch the app in the background just
 * to deliver a geofence or location event.
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { dbLogger } from '../../data/logRepository';
import { GEOFENCE_TASK, LOCATION_TASK } from './constants';
import { handleGeofenceExit, handleLocations } from './engine';

type TaskBody<T> = { data: T; error: TaskManager.TaskManagerError | null };

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: TaskBody<{ locations: Location.LocationObject[] }>) => {
  if (error) return dbLogger.log('task.location.error', { message: error.message }, 'error');
  if (data?.locations?.length) await handleLocations(data.locations);
});

TaskManager.defineTask(
  GEOFENCE_TASK,
  async ({ data, error }: TaskBody<{ eventType: Location.GeofencingEventType; region: Location.LocationRegion }>) => {
    if (error) return dbLogger.log('task.geofence.error', { message: error.message }, 'error');
    if (data?.eventType === Location.GeofencingEventType.Exit) await handleGeofenceExit();
  },
);
