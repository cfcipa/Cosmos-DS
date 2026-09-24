// Cosmos DS · Kit IA · Composer: Draft restore.
// Tablero «Draft restore»: vuelves a un hilo y la frase que nunca enviaste sigue esperando.
// Como en assistant-ui: el aviso muestra cuándo se guardó (la hora llega ya formateada) y el borrador en una línea;
// Restaurar lo devuelve al composer y Descartar lo borra. El padre desmonta el aviso en ambos casos.
// Alert de MUI (severity «info»), con los colores que Cosmos define para él.
import * as React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { Pencil, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface DraftRestoreProps {
  draft: string;
  /** Ya formateado: «hace 2 minutos», «ayer, 16:04». */
  savedAt: string;
  onRestore?: () => void;
  onDiscard?: () => void;
  /** Default 'Borrador sin enviar'. */
  title?: string;
  className?: string;
}

const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;

export function DraftRestore({ draft, savedAt, onRestore, onDiscard, title = 'Borrador sin enviar', className }: DraftRestoreProps) {
  return (
    <Alert
      severity="info"
      icon={<Pencil size={20} />}
      className={className}
      data-slot="draft-restore"
      action={
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {onRestore ? <Button color="inherit" onClick={onRestore}>Restaurar</Button> : null}
          {onDiscard ? <IconButton color="inherit" aria-label="Descartar el borrador" onClick={onDiscard}><X size={18} /></IconButton> : null}
        </Stack>
      }
      sx={(t) => ({
        alignItems: 'center',
        '& .MuiAlert-message': { minWidth: 0, flexGrow: 1 },
        animation: `${fadein} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`,
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      <AlertTitle sx={{ mb: 0.25 }}>{`${title} · ${savedAt}`}</AlertTitle>
      <Typography variant="body2" noWrap title={draft}>{draft}</Typography>
    </Alert>
  );
}
