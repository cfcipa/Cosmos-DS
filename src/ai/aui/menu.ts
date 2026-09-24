// Cosmos DS · Kit IA · AUI connected: estilos de los menús de las primitivas (ActionBarMore, ThreadListItemMore).
// Las primitivas pintan su propio contenedor; le damos la forma de Menu de MUI: Paper elevation 8, 8px arriba y abajo,
// filas de 36px con la columna de ícono de ListItemIcon.
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';

export function auiMenuContent(t: Theme): CSSObject {
  return {
    zIndex: t.zIndex.modal,
    minWidth: t.spacing(22),
    padding: t.spacing(1, 0),
    borderRadius: t.shape.borderRadius,
    backgroundColor: t.palette.background.paper,
    border: t.palette.mode === 'dark' ? `1px solid ${t.palette.divider}` : undefined,
    boxShadow: t.shadows[8],
    outline: 'none',
  };
}

export function auiMenuItem(t: Theme): CSSObject {
  return {
    ...(t.typography.body1 as CSSObject),
    display: 'flex',
    alignItems: 'center',
    minHeight: t.spacing(4.5),
    padding: t.spacing(0.75, 2),
    cursor: 'pointer',
    outline: 'none',
    userSelect: 'none',
    color: t.palette.text.primary,
    '& svg': { minWidth: t.spacing(4.5), color: t.palette.action.active },
    '&:hover, &:focus, &[data-highlighted]': { backgroundColor: t.palette.action.hover },
    '&[data-variant="danger"], &[data-variant="danger"] svg': { color: t.palette.error.main },
    '&[data-variant="danger"]:hover, &[data-variant="danger"][data-highlighted]': { backgroundColor: alpha(t.palette.error.main, t.palette.action.hoverOpacity * 2) },
  };
}
