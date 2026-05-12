import { useSelector } from 'react-redux';
import { selectAppSettings } from '@/redux/settings/selectors';
import languages from './translation/translation';

/**
 * Hook to handle translations across the application.
 * Resolved HMR invalidation by ensuring consistent exports.
 */
const useLanguage = () => {
  const settings = useSelector(selectAppSettings);
  const langCode = settings?.idurar_app_language || 'ar_eg'; // Default to Arabic
  const lang = languages[langCode] || languages['ar_eg'];

  /**
   * Translates a given key using the current language dictionary.
   * Fallback to formatted key if translation is missing.
   * @param {string} key
   * @returns {string}
   */
  const translate = (key) => {
    if (!key) return '';

    // Normalize key to match dictionary format
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/ /g, '_');

    if (lang && lang[lowerCaseKey]) {
      return lang[lowerCaseKey];
    }

    // Fallback: convert underscored_key to Label Case
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return translate;
};

export default useLanguage;
