export type FlowIntensity = 'light' | 'medium' | 'heavy';

export type MoodType = 'happy' | 'calm' | 'sad' | 'irritable' | 'anxious' | 'energetic';

export type CrampSeverity = 0 | 1 | 2 | 3;

export interface SymptomLog {
  date: string; // ISO date, e.g. 2024-05-01
  mood?: MoodType;
  crampSeverity?: CrampSeverity;
  flow?: FlowIntensity;
  notes?: string;
}

export interface PeriodGroup {
  startDate: string;
  endDate: string;
  length: number; // number of days in this period
}

export type LanguagePreference = 'system' | 'en' | 'tr' | 'fr' | 'de';

export interface UserSettings {
  onboardingComplete: boolean;
  averageCycleLength: number; // days between period start dates
  averagePeriodLength: number; // days a period typically lasts
  notificationsEnabled: boolean;
  language: LanguagePreference;
}

export interface CyclePrediction {
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStart: string | null;
  nextPeriodStart: string | null;
  nextPeriodEnd: string | null;
  ovulationDate: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  currentCycleDay: number | null;
}

export interface AppData {
  periodDays: string[];
  symptoms: Record<string, SymptomLog>;
  settings: UserSettings;
}
