import { ThemeOptions } from '@mui/material/styles';
import CosmosTheme from '../../ThemeCOSMOS.json';
import { resolveTokenAsString } from '../utils/resolveToken';

/**
 * TEMA COSMOS DARK - CONFIGURACIONES ESPECÍFICAS DE LA MARCA COSMOS
 *
 * Este archivo contiene únicamente las configuraciones específicas de la marca Cosmos en modo oscuro:
 * - Paleta de colores primarios (violeta) adaptada para dark mode
 * - Tipografía (IBM Plex Sans)
 * - Configuraciones de iconos (Tabler Icons)
 */

export const cosmosDarkTheme: ThemeOptions = {
  // ============================================================================
  // PALETA DE COLORES COSMOS - MODO OSCURO
  // ============================================================================
  palette: {
    mode: 'dark',
    // COLORES PRIMARIOS - Resueltos desde palette.primary para el modo Dark
    // (sigue el alias real de Figma; no asume qué familia de brand-colors usa)
    primary: {
      50: resolveTokenAsString(CosmosTheme.palette.primary[50].$value, 'Dark'),
      100: resolveTokenAsString(CosmosTheme.palette.primary[100].$value, 'Dark'),
      200: resolveTokenAsString(CosmosTheme.palette.primary[200].$value, 'Dark'),
      300: resolveTokenAsString(CosmosTheme.palette.primary[300].$value, 'Dark'),
      400: resolveTokenAsString(CosmosTheme.palette.primary[400].$value, 'Dark'),
      500: resolveTokenAsString(CosmosTheme.palette.primary[500].$value, 'Dark'),
      600: resolveTokenAsString(CosmosTheme.palette.primary[600].$value, 'Dark'),
      700: resolveTokenAsString(CosmosTheme.palette.primary[700].$value, 'Dark'),
      800: resolveTokenAsString(CosmosTheme.palette.primary[800].$value, 'Dark'),
      900: resolveTokenAsString(CosmosTheme.palette.primary[900].$value, 'Dark'),
      main: resolveTokenAsString(CosmosTheme.palette.primary.main.$value, 'Dark'),
      light: resolveTokenAsString(CosmosTheme.palette.primary.light.$value, 'Dark'),
      dark: resolveTokenAsString(CosmosTheme.palette.primary.dark.$value, 'Dark'),
      contrastText: resolveTokenAsString(CosmosTheme.palette.primary.contrastText.$value, 'Dark'),
    },
    // Colores de fondo para modo oscuro
    background: {
      default: resolveTokenAsString(CosmosTheme.palette.background.default.$value, 'Dark'),
      paper: resolveTokenAsString(CosmosTheme.palette.background.paper.$value, 'Dark'),
    },
    // Colores de texto para modo oscuro
    text: {
      primary: resolveTokenAsString(CosmosTheme.palette.text.primary.$value, 'Dark'),
      secondary: resolveTokenAsString(CosmosTheme.palette.text.secondary.$value, 'Dark'),
      disabled: resolveTokenAsString(CosmosTheme.palette.text.disabled.$value, 'Dark'),
    },
    // Líneas divisoras para modo oscuro
    divider: resolveTokenAsString(CosmosTheme.palette.divider.$value, 'Dark'),
    // Acciones para modo oscuro
    action: {
      active: resolveTokenAsString(CosmosTheme.palette.action.active.$value, 'Dark'),
      hover: resolveTokenAsString(CosmosTheme.palette.action.hover.$value, 'Dark'),
      selected: resolveTokenAsString(CosmosTheme.palette.action.selected.$value, 'Dark'),
      disabled: resolveTokenAsString(CosmosTheme.palette.action.disabled.$value, 'Dark'),
      disabledBackground: resolveTokenAsString(CosmosTheme.palette.action.disabledBackground.$value, 'Dark'),
    },
  },

  // ============================================================================
  // TIPOGRAFÍA COSMOS - IBM PLEX SANS
  // ============================================================================
  typography: {
    fontFamily: CosmosTheme.typography.fontFamily.$value,

    // JERARQUÍA DE TÍTULOS - Basada en tokens Cosmos
    h1: {
      fontSize: `${CosmosTheme.typography.heading.h1.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.heading.h1.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.heading.h1.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.heading.h1.letterSpacing.$value}px`,
    },
    h2: {
      fontSize: `${CosmosTheme.typography.heading.h2.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.heading.h2.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.heading.h2.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.heading.h2.letterSpacing.$value}px`,
    },
    h3: {       
      fontSize: `${CosmosTheme.typography.heading.h3.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.heading.h3.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.heading.h3.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.heading.h3.letterSpacing.$value}px`,
    },
    h4: {
      fontSize: `${CosmosTheme.typography.heading.h4.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.heading.h4.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.heading.h4.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.heading.h4.letterSpacing.$value}px`,
    },
    h5: {
      fontSize: `${CosmosTheme.typography.heading.h5.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.heading.h5.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.heading.h5.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.heading.h5.letterSpacing.$value}px`,
    },
    h6: {
      fontSize: `${CosmosTheme.typography.heading.h6.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.heading.h6.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.heading.h6.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.heading.h6.letterSpacing.$value}px`,
    },

    // TEXTO DE CUERPO
    body1: {
      fontSize: `${CosmosTheme.typography.body[1].fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.body[1].fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.body[1].lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.body[1].letterSpacing.$value}px`,
    },
    body2: {
      fontSize: `${CosmosTheme.typography.body[2].fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.body[2].fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.body[2].lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.body[2].letterSpacing.$value}px`,
    },

    // ELEMENTOS ESPECIALES // PENDIENTE POR DEFINIR EN TOKENS
    button: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: '1.25rem',
      textTransform: 'none' as const,
    },
    caption: {
      fontSize: `${CosmosTheme.typography.caption.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.caption.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.caption.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.caption.letterSpacing.$value}px`,
    },
    overline: {
      fontSize: `${CosmosTheme.typography.overline.fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.overline.fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.overline.lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.overline.letterSpacing.$value}px`,
      textTransform: 'uppercase' as const,
    },
    subtitle1: {
      fontSize: `${CosmosTheme.typography.subtitle[1].fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.subtitle[1].fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.subtitle[1].lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.subtitle[1].letterSpacing.$value}px`,
    },
    subtitle2: {
      fontSize: `${CosmosTheme.typography.subtitle[2].fontSize.$value}px`,
      fontWeight: `${CosmosTheme.typography.subtitle[2].fontWeight.$value}`,
      lineHeight: `${CosmosTheme.typography.subtitle[2].lineHeight.$value}px`,
      letterSpacing: `${CosmosTheme.typography.subtitle[2].letterSpacing.$value}px`,
    },
  },  
  // ============================================================================
  // COMPONENTES ESPECÍFICOS COSMOS
  // ============================================================================
  components: {
    // CONFIGURACIÓN DE ICONOS - Tabler Icons para Cosmos
    // Nota: Tabler Icons requiere configuración adicional en el proyecto
    // Los iconos de Tabler se usan típicamente como componentes SVG importados
    // Por ejemplo: import { IconHome } from '@tabler/icons-react';
    MuiSvgIcon: {
      defaultProps: {
        // Tamaño por defecto para iconos SVG
        fontSize: 'medium',
      },
      styleOverrides: {
        root: {
          // Tamaños consistentes con el diseño de Cosmos
          '&.MuiSvgIcon-fontSizeSmall': {
            fontSize: '1.25rem',
          },
          '&.MuiSvgIcon-fontSizeMedium': {
            fontSize: '1.5rem',
          },
          '&.MuiSvgIcon-fontSizeLarge': {
            fontSize: '2rem',
          },
        },
      },
    },
  },
};

export default cosmosDarkTheme;