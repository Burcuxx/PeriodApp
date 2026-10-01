import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_SETTINGS,
  loadPeriodDays,
  loadSettings,
  loadSymptoms,
  savePeriodDays,
  saveSettings,
  saveSymptoms,
} from '../storage/storage';
import { useLocales } from 'expo-localization';
import { getTranslations, resolveLanguage } from '../i18n/languages';
import { CyclePrediction, SymptomLog, UserSettings } from '../types';
import { predictCycle } from '../utils/cyclePredictor';
import { addDaysISO } from '../utils/date';
import {
  cancelAllCycleNotifications,
  scheduleCycleNotifications,
} from '../utils/notifications';

interface AppContextValue {
  loading: boolean;
  periodDays: string[];
  symptoms: Record<string, SymptomLog>;
  settings: UserSettings;
  prediction: CyclePrediction;
  togglePeriodDay: (date: string) => Promise<void>;
  upsertSymptomLog: (date: string, log: Omit<SymptomLog, 'date'>) => Promise<void>;
  completeOnboarding: (lastPeriodStart: string, averageCycleLength: number, averagePeriodLength: number) => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<Record<string, SymptomLog>>({});
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const [days, logs, savedSettings] = await Promise.all([
        loadPeriodDays(),
        loadSymptoms(),
        loadSettings(),
      ]);
      setPeriodDays(days);
      setSymptoms(logs);
      setSettings(savedSettings);
      setLoading(false);
    })();
  }, []);

  const prediction = useMemo(() => predictCycle(periodDays, settings), [periodDays, settings]);

  const deviceLocales = useLocales();
  const language = resolveLanguage(settings.language, deviceLocales);

  useEffect(() => {
    if (loading) return;
    if (settings.notificationsEnabled) {
      scheduleCycleNotifications(prediction, getTranslations(language).notifications).catch(
        () => undefined
      );
    } else {
      cancelAllCycleNotifications().catch(() => undefined);
    }
  }, [loading, prediction, settings.notificationsEnabled, language]);

  const togglePeriodDay = useCallback(async (date: string) => {
    setPeriodDays((prev) => {
      const next = prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date];
      savePeriodDays(next).catch(() => undefined);
      return next;
    });
  }, []);

  const upsertSymptomLog = useCallback(
    async (date: string, log: Omit<SymptomLog, 'date'>) => {
      setSymptoms((prev) => {
        const next = { ...prev, [date]: { date, ...log } };
        saveSymptoms(next).catch(() => undefined);
        return next;
      });
    },
    []
  );

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next).catch(() => undefined);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(
    async (lastPeriodStart: string, averageCycleLength: number, averagePeriodLength: number) => {
      const declaredPeriodDays = Array.from({ length: averagePeriodLength }, (_, i) =>
        addDaysISO(lastPeriodStart, i)
      );
      setPeriodDays((prev) => {
        const next = [...new Set([...prev, ...declaredPeriodDays])];
        savePeriodDays(next).catch(() => undefined);
        return next;
      });
      await updateSettings({
        onboardingComplete: true,
        averageCycleLength,
        averagePeriodLength,
      });
    },
    [updateSettings]
  );

  const value: AppContextValue = {
    loading,
    periodDays,
    symptoms,
    settings,
    prediction,
    togglePeriodDay,
    upsertSymptomLog,
    completeOnboarding,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within an AppProvider');
  return ctx;
}
