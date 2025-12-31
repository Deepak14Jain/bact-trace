import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ✅ Import the AUTO-GENERATED file
import locales from './locales.json'; 

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: locales, // Use the JSON we generated
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;