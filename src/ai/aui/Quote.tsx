// Cosmos DS · Kit IA · AUI connected: Quote.
// Referente: assistant-ui «Quote» (elements/quote.aui.tsx y quote-reply.tsx).
// Al seleccionar texto de un mensaje aparece una barra flotante con «Citar» (y, si se quiere, Explicar y Reescribir,
// que citan y dejan el pedido escrito en el composer). La cita queda sobre el composer, con su botón para descartarla,
// y viaja con el mensaje: en la burbuja del usuario se ve en cursiva, recortada a dos líneas, con el ícono de comillas.
import * as React from 'react';
import { ComposerPrimitive, SelectionToolbarPrimitive, useAui, type QuoteMessagePartComponent } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, styled } from '@mui/material/styles';
import { PencilLine, Quote, Sparkles, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';

/** Medidas de assistant-ui: comillas de 12px en la burbuja y 14px en el composer y la barra. */
const BLOCK_ICON = 12;
const ICON = 14;
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as const;
const toolbarIn = keyframes`from { opacity: 0; transform: scale(.95) translateY(-4px); } to { opacity: 1; transform: none; }`;

/** La cita dentro del mensaje del usuario. Úsala como `Quote` de `MessagePrimitive.Parts` o con `MessagePrimitive.Quote`. */
export const AuiQuoteBlock: QuoteMessagePartComponent = React.memo(function AuiQuoteBlock({ text }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 1 }} data-slot="aui-quote-block">
      <Box component={Quote} sx={{ width: BLOCK_ICON, height: BLOCK_ICON, flexShrink: 0, mt: 0.5, color: 'text.disabled' }} />
      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', minWidth: 0, ...clamp2 }}>{text}</Typography>
    </Stack>
  );
});

const ToolbarRoot = styled(SelectionToolbarPrimitive.Root)(({ theme: t }) => ({
  zIndex: t.zIndex.tooltip,
  animation: `${toolbarIn} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`,
  [REDUCED_MOTION]: { animation: 'none' },
}));

const ToolbarAction = styled(SelectionToolbarPrimitive.Quote)(({ theme: t }) => ({
  ...t.typography.body2,
  display: 'inline-flex', alignItems: 'center', gap: t.spacing(0.75), padding: t.spacing(0.5, 1.25), border: 0, borderRadius: t.shape.borderRadius,
  background: 'transparent', color: t.palette.text.primary, cursor: 'pointer',
  transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
  '&:hover': { backgroundColor: t.palette.action.hover },
  '&:focus-visible': { outline: `2px solid ${t.palette.ai.focusRing}` },
  '& svg': { width: ICON, height: ICON, flexShrink: 0 },
}));

export type AuiQuoteAction = { key: string; label: string; icon: React.ReactNode; /** Lo que queda escrito en el composer. */ prompt?: string };
/** Las acciones del tablero: citar, explicar y reescribir. */
export const AUI_QUOTE_ACTIONS: AuiQuoteAction[] = [
  { key: 'quote', label: 'Citar', icon: <Quote /> },
  { key: 'explain', label: 'Explicar', icon: <Sparkles />, prompt: 'Explícame esto' },
  { key: 'rewrite', label: 'Reescribir', icon: <PencilLine />, prompt: 'Reescríbelo más corto' },
];

type ComposerApi = { composer: () => { setText: (text: string) => void } };

export interface AuiSelectionToolbarProps {
  /** Default: solo «Citar». */
  actions?: AuiQuoteAction[];
}

/** La barra flotante sobre la selección. Va dentro del hilo (en AuiThread: `quotes`). */
export function AuiSelectionToolbar({ actions = [AUI_QUOTE_ACTIONS[0]] }: AuiSelectionToolbarProps) {
  const aui = useAui() as unknown as ComposerApi;
  return (
    <ToolbarRoot data-slot="aui-selection-toolbar">
      <Paper elevation={8} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5 }}>
        {actions.map((a) => (
          <ToolbarAction
            key={a.key}
            type="button"
            onClick={a.prompt ? () => aui.composer().setText(a.prompt as string) : undefined}
          >
            {a.icon}{a.label}
          </ToolbarAction>
        ))}
      </Paper>
    </ToolbarRoot>
  );
}

const PreviewRoot = styled(ComposerPrimitive.Quote)(({ theme: t }) => ({
  display: 'flex', alignItems: 'flex-start', gap: t.spacing(1), padding: t.spacing(1, 1.5), borderRadius: t.shape.borderRadius,
  backgroundColor: t.palette.action.hover,
}));
const PreviewText = styled(ComposerPrimitive.QuoteText)(({ theme: t }) => ({
  ...t.typography.body2, ...clamp2, flex: 1, minWidth: 0, color: t.palette.text.secondary,
}));

/** La cita sobre el composer; solo aparece con una cita puesta. Va dentro de `ComposerPrimitive.Root`. */
export function AuiComposerQuotePreview() {
  return (
    <PreviewRoot data-slot="aui-composer-quote">
      <Box component={Quote} sx={{ width: ICON, height: ICON, flexShrink: 0, mt: 0.25, color: 'text.disabled' }} />
      <PreviewText />
      <ComposerPrimitive.QuoteDismiss asChild>
        <AuiIconButton tooltip="Descartar la cita" size={2.5} sx={{ p: 0.25, '& svg': { width: ICON, height: ICON } }}><X /></AuiIconButton>
      </ComposerPrimitive.QuoteDismiss>
    </PreviewRoot>
  );
}
