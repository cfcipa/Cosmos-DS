import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@mui/material/styles';
import { createBrandTheme } from './theme/utils/createBrandTheme';
import type { BrandType } from './theme/utils/createBrandTheme';
import { withAiKit } from './ai/theme/aiPalette';

const cache = new Map<string, Theme>();

/** Tema de marca + capa del kit de IA (cacheado por marca y modo). */
export function createCosmosTheme(brand: BrandType = 'cosmos', mode: 'light' | 'dark' = 'light'): Theme {
  const key = brand + '/' + mode;
  let t = cache.get(key);
  if (!t) { t = withAiKit(createBrandTheme(brand, mode === 'dark')); cache.set(key, t); }
  return t;
}

export interface CosmosProviderProps {
  brand?: BrandType;
  mode?: 'light' | 'dark';
  /** Incluir CssBaseline (por defecto sí). */
  baseline?: boolean;
  children?: React.ReactNode;
}

export function CosmosProvider({ brand = 'cosmos', mode = 'light', baseline = true, children }: CosmosProviderProps) {
  const theme = React.useMemo(() => createCosmosTheme(brand, mode), [brand, mode]);
  return <ThemeProvider theme={theme}>{baseline ? <CssBaseline /> : null}{children}</ThemeProvider>;
}
