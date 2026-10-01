import AsyncStorage from '@react-native-async-storage/async-storage';
import { SymptomLog, UserSettings } from '../types';

const KEYS = {
  periodDays: '@periodapp/periodDays',
  symptoms: '@periodapp/symptoms',
  settings: '@periodapp/settings',
} as const;

export const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  averageCycleLength: 28,
  averagePeriodLength: 5,
  notificationsEnabled: true,
  language: 'system',
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadPeriodDays(): Promise<string[]> {
  return readJSON<string[]>(KEYS.periodDays, []);
}

export async function savePeriodDays(days: string[]): Promise<void> {
  await writeJSON(KEYS.periodDays, days);
}

export async function loadSymptoms(): Promise<Record<string, SymptomLog>> {
  return readJSON<Record<string, SymptomLog>>(KEYS.symptoms, {});
}

export async function saveSymptoms(symptoms: Record<string, SymptomLog>): Promise<void> {
  await writeJSON(KEYS.symptoms, symptoms);
}

export async function loadSettings(): Promise<UserSettings> {
  // Merge with defaults so settings saved by older versions pick up new fields.
  const saved = await readJSON<Partial<UserSettings>>(KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await writeJSON(KEYS.settings, settings);
}
