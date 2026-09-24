/**
 * Aumentos de tipos de MUI que usa el tema Cosmos.
 *
 * Nota: el paquete «Azul» exige que este archivo exista en el repo de producción,
 * pero no lo trae. Este es un reemplazo mínimo con lo que los archivos del paquete
 * necesitan para compilar; si producción tiene el suyo, reemplaza este archivo por aquel.
 */
import type * as React from 'react';
import type {} from '@mui/x-data-grid/themeAugmentation';

declare module '@mui/material/styles' {
  interface ThemeOptions {
    aiGradient?: string;
    aiGradientBorder?: string;
    aiBackgorundCard?: string;
    aiBackgorundBorder?: string;
  }
  interface Theme {
    aiGradient?: string;
    aiGradientBorder?: string;
    aiBackgorundCard?: string;
    aiBackgorundBorder?: string;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants { body3: React.CSSProperties }
  interface TypographyVariantsOptions { body3?: React.CSSProperties }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides { body3: true }
}

export {};
