import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserMetrics, MetricLog, BodyMeasurementLog, UnitPreferences, MealLog, LogType } from '../types/metrics';
import { storage, STORAGE_KEYS } from '../services/storage';

interface MetricsContextType {
  metrics: UserMetrics;
  updateHeight: (height: number) => Promise<void>;
  addWeightLog: (value: number, unit?: string, date?: string) => Promise<void>;
  addBodyMeasurement: (part: string, value: number, unit?: string, date?: string) => Promise<void>;
  updateCalories: (calories: number) => Promise<void>;
  setCalorieGoal: (goal: number) => Promise<void>;
  updateWater: (current: number, goal?: number) => Promise<void>;
  updateMacros: (macros: { protein: number; carbs: number; fat: number }) => Promise<void>;
  updatePreferences: (prefs: Partial<UnitPreferences>) => Promise<void>;
  updateAge: (age: number) => Promise<void>;
  updateGender: (gender: 'male' | 'female') => Promise<void>;
  addProgressPhoto: (uri: string, date: string) => Promise<void>;
  addMealEntry: (name: string, calories: number, date?: string, foodName?: string, macros?: { protein: number, carbs: number, fat: number }) => Promise<void>;
  completeOnboarding: (data: Partial<UserMetrics>) => Promise<void>;
  simulateData: () => Promise<void>;
  isLoading: boolean;
  bmi: string;
  bmr: string;
  isLogModalVisible: boolean;
  logType: LogType;
  logSubType?: string;
  openLogModal: (type?: LogType, subType?: string) => void;
  closeLogModal: () => void;
  deleteProgressPhoto: (id: string) => Promise<void>;
}

const DEFAULT_METRICS: UserMetrics = {
  hasCompletedOnboarding: false,
  goal: 'maintain',
  age: 25,
  gender: 'male',
  progressPhotos: [],
  meals: [],
  height: null,
  heightHistory: [],
  weightHistory: [],
  bodyMeasurements: [],
  waterHistory: [],
  calories: 0,
  calorieGoal: 2500,
  waterGoal: 2500,
  currentWater: 0,
  macroTargets: {
    protein: 150,
    carbs: 250,
    fat: 70,
  },
  preferences: {
    weight: 'kg',
    height: 'cm',
    body: 'cm',
    fluid: 'ml',
  },
};

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<UserMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [logType, setLogType] = useState<LogType>('weight');
  const [logSubType, setLogSubType] = useState<string | undefined>();

  
  useEffect(() => {
    const loadMetrics = async () => {
      const savedMetrics = await storage.getItem<UserMetrics>(STORAGE_KEYS.USER_METRICS);
      if (savedMetrics) {
        setMetrics({
          ...DEFAULT_METRICS,
          ...savedMetrics,
          hasCompletedOnboarding: savedMetrics.hasCompletedOnboarding ?? false,
          goal: savedMetrics.goal || DEFAULT_METRICS.goal,
          age: savedMetrics.age || DEFAULT_METRICS.age,
          gender: savedMetrics.gender || DEFAULT_METRICS.gender,
          progressPhotos: savedMetrics.progressPhotos || [],
          meals: savedMetrics.meals || [],
          heightHistory: savedMetrics.heightHistory || [],
          weightHistory: savedMetrics.weightHistory || [],
          bodyMeasurements: savedMetrics.bodyMeasurements || [],
          waterHistory: savedMetrics.waterHistory || [],
          macroTargets: savedMetrics.macroTargets || DEFAULT_METRICS.macroTargets,
          waterGoal: savedMetrics.waterGoal || DEFAULT_METRICS.waterGoal,
          currentWater: savedMetrics.currentWater || DEFAULT_METRICS.currentWater,
          preferences: {
            ...DEFAULT_METRICS.preferences,
            ...(savedMetrics.preferences || {}),
          },
        });
      }
      setIsLoading(false);
    };
    loadMetrics();
  }, []);

  
  useEffect(() => {
    if (!isLoading) {
      storage.setItem(STORAGE_KEYS.USER_METRICS, metrics);
    }
  }, [metrics, isLoading]);

  const updateHeight = async (height: number) => {
    setMetrics((prev) => {
      const newLog: MetricLog = {
        id: Math.random().toString(36).substring(7),
        value: height,
        unit: 'cm',
        date: new Date().toISOString(),
      };
      return { 
        ...prev, 
        height,
        heightHistory: [newLog, ...(prev.heightHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });
  };

  const addWeightLog = async (value: number, unit = 'kg', date?: string) => {
    const newLog: MetricLog = {
      id: Math.random().toString(36).substring(7),
      value,
      unit,
      date: date || new Date().toISOString(),
    };
    setMetrics((prev) => ({
      ...prev,
      weightHistory: [newLog, ...prev.weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
  };

  const addBodyMeasurement = async (part: string, value: number, unit = 'cm', date?: string) => {
    const newLog: BodyMeasurementLog = {
      id: Math.random().toString(36).substring(7),
      part,
      value,
      unit,
      date: date || new Date().toISOString(),
    };
    setMetrics((prev) => ({
      ...prev,
      bodyMeasurements: [newLog, ...prev.bodyMeasurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
  };

  const updateCalories = async (calories: number) => {
    setMetrics((prev) => ({ ...prev, calories }));
  };

  const setCalorieGoal = async (goal: number) => {
    setMetrics((prev) => ({ ...prev, calorieGoal: goal }));
  };

  const updateWater = async (current: number, goal?: number) => {
    const today = new Date().toISOString().split('T')[0];
    setMetrics((prev) => {
      const existingHistory = [...(prev.waterHistory || [])];
      const todayIndex = existingHistory.findIndex(log => log.date.startsWith(today));
      
      const newLog = {
        id: todayIndex >= 0 ? existingHistory[todayIndex].id : Math.random().toString(36).substring(7),
        value: current,
        unit: 'ml',
        date: todayIndex >= 0 ? existingHistory[todayIndex].date : new Date().toISOString()
      };

      if (todayIndex >= 0) {
        existingHistory[todayIndex] = newLog;
      } else {
        existingHistory.unshift(newLog);
      }

      return { 
        ...prev, 
        currentWater: current,
        ...(goal !== undefined && { waterGoal: goal }),
        waterHistory: existingHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });
  };

  const updateMacros = async (macros: { protein: number; carbs: number; fat: number }) => {
    setMetrics((prev) => ({ ...prev, macroTargets: macros }));
  };

  const updatePreferences = async (newPrefs: Partial<UnitPreferences>) => {
    setMetrics((prev) => ({ 
      ...prev, 
      preferences: { ...prev.preferences, ...newPrefs } 
    }));
  };

  const updateAge = async (age: number) => {
    setMetrics((prev) => ({ ...prev, age }));
  };

  const updateGender = async (gender: 'male' | 'female') => {
    setMetrics((prev) => ({ ...prev, gender }));
  };

  const addProgressPhoto = async (uri: string, date: string) => {
    const newPhoto = {
      id: Math.random().toString(36).substring(7),
      uri,
      date,
    };
    setMetrics((prev) => ({
      ...prev,
      progressPhotos: [newPhoto, ...prev.progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
  };

  const deleteProgressPhoto = async (id: string) => {
    setMetrics((prev) => ({
      ...prev,
      progressPhotos: (prev.progressPhotos || []).filter((p) => p.id !== id),
    }));
  };

  const addMealEntry = async (name: string, calories: number, date?: string, foodName?: string, macros?: { protein: number, carbs: number, fat: number }) => {
    const newMeal: MealLog = {
      id: Math.random().toString(36).substring(7),
      name,
      calories,
      date: date || new Date().toISOString(),
      foodName,
      macros,
    };
    setMetrics((prev) => ({
      ...prev,
      calories: (prev.calories || 0) + calories,
      meals: [newMeal, ...(prev.meals || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
  };

  const completeOnboarding = async (data: Partial<UserMetrics>) => {
    setMetrics((prev) => ({
      ...prev,
      ...data,
      hasCompletedOnboarding: true,
    }));
  };

  const simulateData = async () => {
    const mockWeightHistory: MetricLog[] = [];
    const mockBodyMeasurements: BodyMeasurementLog[] = [];
    const mockWaterHistory: MetricLog[] = [];
    const mockMeals: MealLog[] = [];
    const mockHeightHistory: MetricLog[] = [];
    
    
    let currentWeight = 80; 
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();
      
      
      currentWeight = currentWeight - (Math.random() * 0.2) + (Math.random() * 0.1);
      
      mockWeightHistory.push({
        id: Math.random().toString(36).substring(7),
        value: Number(currentWeight.toFixed(1)),
        unit: 'kg',
        date: dateStr,
      });

      mockWaterHistory.push({
        id: Math.random().toString(36).substring(7),
        value: Math.floor(Math.random() * 1000) + 2000,
        unit: 'ml',
        date: dateStr,
      });

      mockMeals.push({
        id: Math.random().toString(36).substring(7),
        name: 'Simulated Day Total',
        calories: Math.floor(Math.random() * 600) + 1800,
        date: dateStr,
      });

      mockHeightHistory.push({
        id: Math.random().toString(36).substring(7),
        value: 180,
        unit: 'cm',
        date: dateStr,
      });

      
      if (i % 5 === 0) {
        mockBodyMeasurements.push({
          id: Math.random().toString(36).substring(7),
          part: 'Biceps',
          value: Number((38 + (30 - i) * 0.05).toFixed(1)), 
          unit: 'cm',
          date: dateStr,
        });
      }
    }

    setMetrics((prev) => ({
      ...prev,
      weightHistory: mockWeightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      bodyMeasurements: mockBodyMeasurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      waterHistory: mockWaterHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      heightHistory: mockHeightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      meals: [...mockMeals, ...(prev.meals || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      calories: Math.floor(Math.random() * 500) + 2000,
      height: 180,
    }));
  };

  const openLogModal = (type?: LogType, subType?: string) => {
    const validTypes: LogType[] = ['weight', 'body', 'height', 'calories', 'water'];
    if (type && validTypes.includes(type)) {
      setLogType(type);
      setLogSubType(subType);
    } else {
      setLogType('weight');
      setLogSubType(undefined);
    }
    setIsLogModalVisible(true);
  };
  const closeLogModal = () => {
    setIsLogModalVisible(false);
    setLogSubType(undefined);
  };

  const bmi = metrics.height && metrics.weightHistory.length > 0 
    ? (metrics.weightHistory[0].value / Math.pow(metrics.height / 100, 2)).toFixed(1)
    : '--';
    
  const bmr = metrics.height && metrics.weightHistory.length > 0
    ? Math.round(
        10 * metrics.weightHistory[0].value + 
        6.25 * metrics.height - 
        5 * (metrics.age || 25) + 
        (metrics.gender === 'male' ? 5 : -161)
      ).toString()
    : '--';

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        updateHeight,
        addWeightLog,
        addBodyMeasurement,
        updateCalories,
        setCalorieGoal,
        updateWater,
        updateMacros,
        updatePreferences,
        updateAge,
        updateGender,
        addProgressPhoto,
        addMealEntry,
        completeOnboarding,
        simulateData,
        isLoading,
        bmi,
        bmr,
        isLogModalVisible,
        logType,
        logSubType,
        openLogModal,
        closeLogModal,
        deleteProgressPhoto,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
