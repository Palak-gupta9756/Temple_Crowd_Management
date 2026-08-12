import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "../locales/en/translation.json";
import hiTranslation from "../locales/hi/translation.json";
import guTranslation from "../locales/gu/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
      gu: { translation: guTranslation },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "gu"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "yatrasetu_lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
