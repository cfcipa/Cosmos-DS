// Cosmos DS · Kit IA · Knowledge: Document reference.
// Tablero «Document reference»: un documento en el que se apoya la respuesta, con el pasaje citado y la página a la que saltar.
// Como en assistant-ui: todos los pasajes de la página activa se resaltan, pero solo el primero lleva aria-current;
// con onJump cada pasaje es un botón que salta a su página, sin él son solo lectura.
// Paper outlined con el encabezado del archivo y una List de ListItemButton (selected = página activa).
import * as React from 'react';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { FileText } from 'lucide-react';

export interface DocumentAnchor {
  page: number;
  quote: string;
}

export interface DocumentReferenceProps {
  title: string;
  pages: number;
  anchors: readonly DocumentAnchor[];
  /** La página abierta: sus pasajes se resaltan. */
  activePage: number;
  /** Salta a la página del pasaje. Sin él, los pasajes no son botones. */
  onJump?: (page: number) => void;
  /** Default «N páginas · M citadas». */
  metaLabel?: (pages: number, cited: number) => string;
  className?: string;
}

const defaultMeta = (pages: number, cited: number) => `${pages} páginas · ${cited} ${cited === 1 ? 'citada' : 'citadas'}`;

export function DocumentReference({ title, pages, anchors, activePage, onJump, metaLabel = defaultMeta, className }: DocumentReferenceProps) {
  // Varios pasajes pueden citar la misma página; solo uno es el elemento actual.
  const currentIndex = anchors.findIndex((anchor) => anchor.page === activePage);

  return (
    <Paper
      variant="outlined"
      role="group"
      aria-label={`Documento citado: ${title}`}
      className={className}
      data-slot="document-reference"
      sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 0.5, pt: 0.5 }}>
        <Stack aria-hidden="true" sx={{ color: 'action.active', flexShrink: 0 }}><FileText size={20} /></Stack>
        <Stack spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle1" noWrap title={title}>{title}</Typography>
          <Typography variant="body3" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{metaLabel(pages, anchors.length)}</Typography>
        </Stack>
      </Stack>

      {anchors.length ? (
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {anchors.map((anchor, i) => {
            const isActive = anchor.page === activePage;
            const content = (
              <>
                <Chip size="small" variant="outlined" label={`p. ${anchor.page}`} sx={{ fontVariantNumeric: 'tabular-nums', bgcolor: 'background.paper' }} />
                <Typography variant="body2" color="text.secondary" sx={{ pl: 1, borderLeft: 2, borderColor: 'divider', overflowWrap: 'anywhere' }}>
                  {anchor.quote}
                </Typography>
              </>
            );
            const itemSx = { flexDirection: 'column', alignItems: 'flex-start', gap: 0.75, p: 1, borderRadius: 1 } as const;
            return (
              <ListItem key={`${anchor.page}-${i}`} disablePadding>
                {onJump ? (
                  <ListItemButton
                    selected={isActive}
                    aria-current={i === currentIndex || undefined}
                    aria-label={`Ir a la página ${anchor.page}: ${anchor.quote}`}
                    onClick={() => onJump(anchor.page)}
                    sx={itemSx}
                  >
                    {content}
                  </ListItemButton>
                ) : (
                  <Stack
                    aria-current={i === currentIndex || undefined}
                    sx={(t: Theme) => ({ ...itemSx, width: '100%', display: 'flex', ...(isActive ? { bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity) } : null) })}
                  >
                    {content}
                  </Stack>
                )}
              </ListItem>
            );
          })}
        </List>
      ) : null}
    </Paper>
  );
}
