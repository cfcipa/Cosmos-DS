import { createTheme, Theme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import getBaseThemeConfig from '../base/baseTheme';
import cosmosLightTheme from '../cosmos/cosmosLightTheme';
import cosmosDarkTheme from '../cosmos/cosmosDarkTheme';

// Paquete «Azul»: solo trae Cosmos. Sinco, AD Proveedor, ADC y Bitákora se agregan
// cuando lleguen sus archivos theme/<marca>/* (el paquete los da por existentes).
export type BrandType = 'cosmos';

/**
 * Crea un tema completo combinando el tema base con el tema específico de la marca
 *
 * @param brand - La marca para la cual crear el tema ('cosmos' o 'sinco')
 * @param isDarkMode - Si el tema debe ser oscuro o claro
 * @param primaryOverride - Sobreescribe palette.primary después de aplicar el tema
 *   de marca. Se usa para comparar propuestas de color de Cosmos sin tocar
 *   ThemeCOSMOS.json (ver theme/cosmos/colorProposals.ts).
 * @returns Un tema completo de Material-UI
 */
export function createBrandTheme(brand: BrandType, isDarkMode: boolean = false, primaryOverride?: Record<string, string>): Theme {
  // Seleccionar el tema específico de la marca y modo
  let brandTheme;
  switch (brand) {
    case 'cosmos':
      brandTheme = isDarkMode ? cosmosDarkTheme : cosmosLightTheme;
      break;
    default:
      brandTheme = cosmosLightTheme;
  }

  // Combinar el tema base con el tema de la marca
  // deepmerge da prioridad a las propiedades del segundo objeto (brandTheme)
  const baseThemeConfig = getBaseThemeConfig(isDarkMode ? 'Dark' : 'Light');
  let mergedThemeOptions = deepmerge(baseThemeConfig, brandTheme);

  if (primaryOverride) {
    mergedThemeOptions = deepmerge(mergedThemeOptions, { palette: { primary: primaryOverride } });
  }

  // Crear el tema final de Material-UI
  const theme = createTheme(mergedThemeOptions);

  return theme;
}

// Exportar temas pre-construidos para conveniencia
export const cosmosTheme = createBrandTheme('cosmos', false);
export const cosmosDarkThemeExport = createBrandTheme('cosmos', true);
