import { useLocales } from 'expo-localization';
import { LocaleConfig } from 'react-native-calendars';
import { useAppData } from '../context/AppContext';
import { formatDisplayDate } from '../utils/date';
import { getDateLocale, getTranslations, resolveLanguage } from './languages';
import { AppLanguage, Translations } from './translations';

export { SUPPORTED_LANGUAGES } from './languages';
export { LANGUAGE_NAMES } from './translations';
export type { AppLanguage, Translations } from './translations';

export interface I18n {
  language: AppLanguage;
  t: Translations;
  /** Formats an ISO date string in the active language. */
  formatDate: (iso: string) => string;
}

export function useI18n(): I18n {
  const { settings } = useAppData();
  const deviceLocales = useLocales();
  const language = resolveLanguage(settings.language, deviceLocales);
  LocaleConfig.defaultLocale = language;
  const dateLocale = getDateLocale(language);
  return {
    language,
    t: getTranslations(language),
    formatDate: (iso) => formatDisplayDate(iso, dateLocale),
  };
}
