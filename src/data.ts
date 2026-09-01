import { UnitData, PourActivity, ExerciseItem, ComplementItem } from './types';
import {
  UNITS_DATA_AR,
  POUR_ACTIVITIES_DATA_AR,
  EXERCISES_DATA_AR,
  COMPLEMENT_DATA_AR,
  getUnitsData,
  getPourActivitiesData,
  getExercisesData,
  getComplementData,
} from './i18n/data_i18n';

export const UNITS_DATA: UnitData[] = UNITS_DATA_AR;
export const POUR_ACTIVITIES_DATA: PourActivity[] = POUR_ACTIVITIES_DATA_AR;
export const EXERCISES_DATA: ExerciseItem[] = EXERCISES_DATA_AR;
export const COMPLEMENT_DATA: ComplementItem[] = COMPLEMENT_DATA_AR;

export {
  getUnitsData,
  getPourActivitiesData,
  getExercisesData,
  getComplementData,
};
