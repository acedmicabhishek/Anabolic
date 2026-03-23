export interface MetricLog {
  id: string;
  value: number;
  unit: string;
  date: string; 
}

export interface BodyMeasurementLog extends MetricLog {
  part: string; 
}

export interface UnitPreferences {
  weight: 'kg' | 'lb';
  height: 'cm' | 'inch' | 'ft';
  body: 'cm' | 'inch';
  fluid: 'ml' | 'oz';
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
}

export interface MealLog {
  id: string;
  name: string; 
  calories: number;
  date: string;
  foodName?: string;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UserMetrics {
  hasCompletedOnboarding: boolean;
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight?: number | null;
  age: number;
  gender: 'male' | 'female';
  progressPhotos: ProgressPhoto[];
  meals: MealLog[];
  height: number | null; 
  heightHistory?: MetricLog[];
  weightHistory: MetricLog[];
  bodyMeasurements: BodyMeasurementLog[];
  waterHistory?: MetricLog[];
  calories: number;
  calorieGoal: number;
  waterGoal: number;
  currentWater: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  preferences: UnitPreferences;
}

export type BodyPart = 'Biceps' | 'Waist' | 'Chest' | 'Clavicle' | 'Shoulders' | 'Quads' | 'Calves';

export const BODY_PARTS: BodyPart[] = [
  'Biceps',
  'Waist',
  'Chest',
  'Clavicle',
  'Shoulders',
  'Quads',
  'Calves',
];

export type LogType = 'weight' | 'body' | 'height' | 'calories' | 'water';

export type BodyMeasurementMap = Record<string, BodyMeasurementLog>;
