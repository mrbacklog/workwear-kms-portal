import { createContext, useContext } from 'react';
import { translations, type TranslationKey } from './kms-translations';

export interface BolusModeContextValue {
  t: (key: TranslationKey) => string;
  bolusActive: boolean;
}

export const BolusModeContext = createContext<BolusModeContextValue>({
  t: (key) => translations.nl[key],
  bolusActive: false,
});

export function useBolusModeContext(): BolusModeContextValue {
  return useContext(BolusModeContext);
}
