// Cosmos DS · Kit IA · AUI connected (Sinco): Floating composer.
// Referente: el tablero «Floating composer», sobre las primitivas del composer de assistant-ui.
// El asistente cerrado: una píldora que flota abajo al centro de la pantalla. Tocarla (o Enter) abre el panel flotante
// sin perder el chat; el + adjunta y abre; el micrófono abre y dicta. Mientras corre una respuesta, el micrófono pasa
// a detener. Con mensajes, el texto invita a seguir («¿Qué hacemos ahora?»).
import * as React from 'react';
import { AuiIf, ComposerPrimitive, useAui, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import { alpha, keyframes } from '@mui/material/styles';
import { Mic, Plus, Square } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';
import { AUI_ASSISTANT_FOLLOWUP_PLACEHOLDER, AUI_ASSISTANT_PLACEHOLDER, useAuiAssistant } from './AssistantPanel';

export interface AuiComposerPillProps {
  /** Default '¿Por dónde empezamos?'. */
  placeholder?: string;
  /** Con mensajes. Default '¿Qué hacemos ahora?'. */
  followupPlaceholder?: string;
  /** Además de abrir el asistente (o en lugar de él, fuera de `AuiAssistantProvider`). */
  onOpen?: () => void;
}

/** Medidas del tablero: 48px de alto, botones de 34px, íconos de 20px (detener, 14px). */
const HEIGHT = 6;
const BUTTON = 4.25;
const ICON = 20;
const STOP = 14;
const rise = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;

export function AuiComposerPill({ placeholder = AUI_ASSISTANT_PLACEHOLDER, followupPlaceholder = AUI_ASSISTANT_FOLLOWUP_PLACEHOLDER, onOpen }: AuiComposerPillProps) {
  const assistant = useAuiAssistant();
  const aui = useAui() as unknown as { composer: () => { startDictation: () => void } };
  const hasMessages = useAuiState((s) => s.thread.messages.length > 0);
  const canDictate = useAuiState((s) => s.thread.capabilities.dictation);
  const open = () => { assistant?.open(); onOpen?.(); };
  const text = hasMessages ? followupPlaceholder : placeholder;
  return (
    <Paper
      elevation={8}
      data-slot="aui-composer-pill"
      onClick={(e) => { if (e.target === e.currentTarget) open(); }}
      sx={(t) => ({
        display: 'flex', alignItems: 'center', gap: 0.5, height: t.spacing(HEIGHT), px: 0.75, boxSizing: 'border-box', borderRadius: t.spacing(HEIGHT),
        border: 1, borderColor: 'divider', cursor: 'text', animation: `${rise} ${t.transitions.duration.shorter}ms ease-out both`,
        transition: t.transitions.create('border-color', { duration: t.transitions.duration.shortest }),
        '&:hover': { borderColor: 'action.disabled' },
        '& .MuiIconButton-root': { borderRadius: '50%', '& svg': { width: ICON, height: ICON } },
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      <ComposerPrimitive.AddAttachment asChild>
        <AuiIconButton tooltip="Agregar adjunto" size={BUTTON} onClick={open}><Plus /></AuiIconButton>
      </ComposerPrimitive.AddAttachment>
      <ButtonBase
        aria-label="Abrir el asistente"
        onClick={open}
        sx={(t) => ({ flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'flex-start', px: 0.5, borderRadius: 1, '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` } })}
      >
        <Box component="span" sx={(t) => ({ ...t.typography.body1, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{text}</Box>
      </ButtonBase>
      {canDictate ? (
        <>
          <AuiIf condition={(s) => !s.thread.isRunning && s.composer.dictation == null}>
            <AuiIconButton tooltip="Dictar" size={BUTTON} onClick={() => { open(); aui.composer().startDictation(); }}><Mic /></AuiIconButton>
          </AuiIf>
          <AuiIf condition={(s) => !s.thread.isRunning && s.composer.dictation != null}>
            <ComposerPrimitive.StopDictation asChild>
              <AuiIconButton tooltip="Detener el dictado" size={BUTTON} aria-pressed sx={(t) => ({ color: 'error.main', bgcolor: alpha(t.palette.error.main, t.palette.action.selectedOpacity) })}><Mic /></AuiIconButton>
            </ComposerPrimitive.StopDictation>
          </AuiIf>
        </>
      ) : null}
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <AuiIconButton
            tooltip="Detener la respuesta"
            size={BUTTON}
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&& svg': { width: STOP, height: STOP } }}
          >
            <Square fill="currentColor" />
          </AuiIconButton>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </Paper>
  );
}
