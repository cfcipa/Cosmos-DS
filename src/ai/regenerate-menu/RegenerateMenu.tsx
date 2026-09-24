// Cosmos DS · Kit IA · Messages: Regenerate with.
// Tablero aprobado «Regenerate with»: bifurca el mismo turno hacia otro modelo en lugar de volver a tirar los mismos dados.
// Como en assistant-ui: la lista se abre y se cierra solo con el disparador (no con clic afuera ni Esc),
// marca el modelo actual y, sin onPick, las opciones se muestran pero no se eligen.
// Botón dividido = ButtonGroup de MUI; la lista es un panel en línea (Paper + MenuList), como en la referencia.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import { keyframes } from '@mui/material/styles';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface RegenerateOption {
  id: string;
  label: string;
  /** «más lento», «equilibrado». En la opción actual se muestra «actual». */
  detail: string;
}

export interface RegenerateMenuProps {
  options: readonly RegenerateOption[];
  open: boolean;
  currentId: string;
  /** Regenerando: el ícono gira y el botón se desactiva. */
  regenerating?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Regenera con el mismo modelo. */
  onRegenerate?: () => void;
  /** Regenera con otro modelo. Sin él, las opciones se muestran pero no se pueden elegir. */
  onPick?: (id: string) => void;
  className?: string;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

export function RegenerateMenu({
  options,
  open,
  currentId,
  regenerating = false,
  onOpenChange,
  onRegenerate,
  onPick,
  className,
}: RegenerateMenuProps) {
  return (
    <Box className={className} data-slot="regenerate-menu" sx={{ alignSelf: 'flex-start' }}>
      <ButtonGroup variant="outlined" aria-label="Regenerar">
        <Button
          disabled={regenerating}
          onClick={onRegenerate}
          startIcon={
            <Box component="span" sx={{ display: 'inline-flex', ...(regenerating ? { animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } } : null) }}>
              <RefreshCw size={16} />
            </Box>
          }
        >
          Regenerar
        </Button>
        {onOpenChange ? (
          <Button aria-label="Regenerar con otro modelo" aria-haspopup="menu" aria-expanded={open} onClick={() => onOpenChange(!open)}>
            <ChevronDown size={16} />
          </Button>
        ) : null}
      </ButtonGroup>

      {open ? (
        <Paper variant="outlined" sx={{ mt: 0.5, minWidth: 260, width: 'fit-content' }}>
          <MenuList aria-label="Regenerar con">
            {options.map((option) => {
              const isCurrent = option.id === currentId;
              return (
                <MenuItem
                  key={option.id}
                  role="menuitemradio"
                  aria-checked={isCurrent}
                  selected={isCurrent}
                  disabled={!onPick}
                  onClick={() => onPick?.(option.id)}
                  sx={{ '&.Mui-disabled': { opacity: 1 } }}
                >
                  <ListItemText
                    primary={option.label}
                    secondary={isCurrent ? 'actual' : option.detail}
                    secondaryTypographyProps={isCurrent ? { color: 'primary.main' } : undefined}
                  />
                </MenuItem>
              );
            })}
          </MenuList>
        </Paper>
      ) : null}
    </Box>
  );
}
