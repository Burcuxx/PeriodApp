import { getLocales } from 'expo-localization';
import { LanguagePreference } from '../types';
import { AppLanguage, DATE_LOCALES, translations, Translations } from './translations';

export const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'tr', 'fr', 'de'];
const FALLBACK_LANGUAGE: AppLanguage = 'en';

function isSupported(code: string | null | undefined): code is AppLanguage {
  return !!code && (SUPPORTED_LANGUAGES as string[]).includes(code);
}

/** Resolves the user's preference to a concrete language; "system" picks the first supported device language, or English. */
export function resolveLanguage(
  preference: LanguagePreference,
  locales: { languageCode: string | null }[] = getLocales()
): AppLanguage {
  if (preference !== 'system') return preference;
  return locales.map((l) => l.languageCode).find(isSupported) ?? FALLBACK_LANGUAGE;
}

export function getTranslations(language: AppLanguage): Translations {
  return translations[language];
}

export function getDateLocale(language: AppLanguage): string {
  return DATE_LOCALES[language];
}
