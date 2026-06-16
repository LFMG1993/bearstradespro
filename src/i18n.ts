import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';
import ptTranslation from './locales/pt.json';

const resources = {
  es: {
    translation: esTranslation
  },
  en: {
    translation: enTranslation
  },
  pt: {
    translation: ptTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
