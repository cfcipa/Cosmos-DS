// Cosmos DS · Kit IA · AUI connected (Sinco): Inline prompt.
// Referente: el tablero «Inline prompt» (no hay una primitiva única: IconButton + Popover + un hilo pequeño de
// assistant-ui).
// Un disparador de IA sobre un elemento de la pantalla (un campo, una fila, el registro entero) que abre ahí mismo un
// composer pequeño con acciones sugeridas; la respuesta llega en el mismo lugar y se puede seguir preguntando. Cada
// disparador tiene su propia conversación, que se conserva al cerrarlo. El composer va en una fila y pasa a dos cuando
// el texto no cabe, hay un adjunto o se dicta. Esc cierra y devuelve el foco al disparador; ↓ desde el composer va a
// las acciones.
import * as React from 'react';
import {
  ActionBarPrimitive, AssistantRuntimeProvider, AuiIf, ComposerPrimitive, MessagePrimitive, ThreadPrimitive, useAssistantInstructions, useAui, useAuiState,
  useLocalRuntime, type ChatModelAdapter, type TextMessagePartComponent,
} from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ArrowUp, Check, Copy, Mic, MoonStar, Plus, RefreshCw, Square } from 'lucide-react';
import { AuiIconButton } from './AuiIconButton';
import { AuiComposerAttachments } from './Attachment';
import { AuiMarkdownText } from './MarkdownText';

type LocalRuntimeOptions = NonNullable<Parameters<typeof useLocalRuntime>[1]>;
export type AuiInlinePromptAction = { title: string; icon?: React.ReactNode };

export interface AuiInlinePromptProps {
  /** El modelo que responde aquí. Debe ser estable. */
  adapter: ChatModelAdapter;
  /** Adjuntos, dictado… del runtime local. Deben ser estables. */
  adapters?: LocalRuntimeOptions['adapters'];
  /** Lo que el modelo sabe del elemento («El campo Valor de la factura FV-0932: $ 2.400.000»). */
  instruction?: string;
  /** Las acciones del composer vacío. */
  actions?: readonly AuiInlinePromptAction[];
  /** Default 'Pregunta sobre este campo…'. */
  placeholder?: string;
  /** Con conversación. Default 'Pregunta algo más…'. */
  followupPlaceholder?: string;
  /** Default 'Preguntar a la IA'. */
  label?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Medidas del tablero: disparador de 28px con ícono de 16px; popover de 360px, conversación de hasta 300px; botones
 * del composer de 28px. */
const TRIGGER = 3.5;
const TRIGGER_ICON = 16;
const POP_WIDTH = 45;
const CONV_MAX = 37.5;
const BUTTON = 3.5;
const ICON = 16;
const STOP = 12;
const INPUT_MAX = 12.5;

/**
 * El elemento con disparador: una fila o un encabezado. `show` decide cuándo se ve el disparador: al pasar por encima
 * (o con el foco, o mientras está abierto), siempre o nunca.
 */
export function AuiInlinePromptAnchor({ show = 'hover', sx, children, ...rest }: { show?: 'hover' | 'always' | 'none'; sx?: SxProps<Theme>; children: React.ReactNode } & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>) {
  return (
    <Box
      data-slot="aui-inline-prompt-anchor"
      data-show={show}
      {...rest}
      sx={[
        {
          position: 'relative',
          '&[data-show="hover"] [data-slot="aui-inline-prompt-trigger"]': { opacity: 0 },
          '&[data-show="hover"]:hover [data-slot="aui-inline-prompt-trigger"], &[data-show="hover"]:focus-within [data-slot="aui-inline-prompt-trigger"], & [data-slot="aui-inline-prompt-trigger"][aria-expanded="true"]': { opacity: 1 },
          '&[data-show="none"] [data-slot="aui-inline-prompt-trigger"]': { display: 'none' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export function AuiInlinePrompt({
  adapter, adapters, instruction, actions = [], placeholder = 'Pregunta sobre este campo…', followupPlaceholder = 'Pregunta algo más…', label = 'Preguntar a la IA',
  open: openProp, onOpenChange,
}: AuiInlinePromptProps) {
  const runtime = useLocalRuntime(adapter, { adapters });
  const [own, setOwn] = React.useState(false);
  const open = openProp ?? own;
  const setOpen = (o: boolean) => { if (openProp === undefined) setOwn(o); onOpenChange?.(o); };
  const trigger = React.useRef<HTMLButtonElement>(null);
  const anchor = () => (trigger.current?.closest<HTMLElement>('[data-slot="aui-inline-prompt-anchor"]') ?? trigger.current) as HTMLElement;
  return (
    <>
      <Tooltip title={open ? '' : label} placement="left">
        <ButtonBase
          ref={trigger}
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          data-slot="aui-inline-prompt-trigger"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          sx={(t) => ({
            width: t.spacing(TRIGGER), height: t.spacing(TRIGGER), flexShrink: 0, borderRadius: '50%', color: t.palette.ai.markIcon,
            background: `linear-gradient(135deg, ${t.palette.ai.markStart}, ${t.palette.ai.markEnd})`,
            transition: t.transitions.create(['opacity', 'box-shadow'], { duration: t.transitions.duration.shorter }),
            '&:hover': { boxShadow: t.shadows[2] }, '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
          })}
        >
          <MoonStar size={TRIGGER_ICON} />
        </ButtonBase>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        // La conversación se conserva al cerrar: el hilo sigue montado.
        keepMounted
        slotProps={{ paper: { role: 'dialog', 'aria-label': label, 'data-slot': 'aui-inline-prompt', sx: (t: Theme) => ({ width: t.spacing(POP_WIDTH), maxWidth: `calc(100% - ${t.spacing(2)})`, mt: 0.5, display: 'flex', flexDirection: 'column' }) } as object }}
      >
        <AssistantRuntimeProvider runtime={runtime}>
          {instruction ? <Instruction text={instruction} /> : null}
          <InlineThread open={open} actions={actions} placeholder={placeholder} followupPlaceholder={followupPlaceholder} />
        </AssistantRuntimeProvider>
      </Popover>
    </>
  );
}

function Instruction({ text }: { text: string }) {
  useAssistantInstructions(text);
  return null;
}

const InlineInput = styled(ComposerPrimitive.Input)(({ theme: t }) => ({
  ...t.typography.body1, gridArea: 'in', display: 'block', width: '100%', minWidth: 0, maxHeight: t.spacing(INPUT_MAX), boxSizing: 'border-box', padding: t.spacing(0.5),
  border: 0, outline: 'none', resize: 'none', background: 'transparent', color: t.palette.text.primary, caretColor: t.palette.primary.main,
  '&::placeholder': { color: t.palette.text.secondary, opacity: 1 },
}));

/** Una fila mientras el texto quepa (medido contra el ancho de la fila), sin adjuntos ni dictado. */
function useCompact(input: React.RefObject<HTMLTextAreaElement>) {
  const text = useAuiState((s) => s.composer.text);
  const busy = useAuiState((s) => s.composer.attachments.length > 0 || s.composer.dictation != null);
  const width = React.useRef(0);
  const [wide, setWide] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    if (!wide && !busy) width.current = el.clientWidth;
    const style = window.getComputedStyle(el);
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return;
    ctx.font = `${style.fontSize} ${style.fontFamily}`;
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    setWide(text.includes('\n') || ctx.measureText(text).width + padding > width.current);
  }, [text, busy, wide, input]);
  return !wide && !busy;
}

function InlineThread({ open, actions, placeholder, followupPlaceholder }: { open: boolean; actions: readonly AuiInlinePromptAction[]; placeholder: string; followupPlaceholder: string }) {
  const aui = useAui() as unknown as { thread: () => { append: (m: { role: 'user'; content: Array<{ type: 'text'; text: string }> }) => void } };
  const hasMessages = useAuiState((s) => s.thread.messages.length > 0);
  const canDictate = useAuiState((s) => s.thread.capabilities.dictation);
  const canAttach = useAuiState((s) => s.thread.capabilities.attachments);
  const input = React.useRef<HTMLTextAreaElement>(null);
  const menu = React.useRef<HTMLUListElement>(null);
  const compact = useCompact(input);
  React.useEffect(() => {
    if (!open) return undefined;
    const id = window.requestAnimationFrame(() => input.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);
  const onInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'ArrowDown' || !compact) return;
    const first = menu.current?.querySelector<HTMLElement>('[role="menuitem"]');
    if (first) { e.preventDefault(); first.focus(); }
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && document.activeElement === menu.current?.querySelector('[role="menuitem"]')) { e.preventDefault(); input.current?.focus(); }
  };
  const send = (text: string) => { aui.thread().append({ role: 'user', content: [{ type: 'text', text }] }); input.current?.focus(); };
  return (
    <ThreadPrimitive.Root data-slot="aui-inline-prompt-thread" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {hasMessages ? (
        <>
          <ThreadPrimitive.Viewport autoScroll style={{ overflowY: 'auto' }}>
            <Box sx={(t) => ({ maxHeight: t.spacing(CONV_MAX), px: 0.5, pt: 1.5, pb: 0.5 })}>
              <Stack spacing={1.5}>
                <ThreadPrimitive.Messages>{() => <InlineMessage />}</ThreadPrimitive.Messages>
              </Stack>
            </Box>
          </ThreadPrimitive.Viewport>
          <Divider />
        </>
      ) : null}
      <ComposerPrimitive.Root style={{ flexShrink: 0 }}>
        <Box
          data-slot="aui-inline-prompt-composer"
          data-compact={String(compact)}
          sx={(t) => ({
            display: 'grid', gridTemplateColumns: `${t.spacing(BUTTON)} minmax(0, 1fr) ${t.spacing(BUTTON)} ${t.spacing(BUTTON)}`,
            gridTemplateAreas: '"atts atts atts atts" "att in mic send"', alignItems: 'center', columnGap: 0.5, px: 1.25, py: 1,
            '&[data-compact="false"]': { gridTemplateAreas: '"atts atts atts atts" "in in in in" "att . mic send"', rowGap: 0.5, pt: 1.25 },
            '& .MuiIconButton-root svg': { width: ICON, height: ICON },
          })}
        >
          <Box sx={{ gridArea: 'atts', '&:empty': { display: 'none' } }}><AuiComposerAttachments /></Box>
          {canAttach ? (
            <ComposerPrimitive.AddAttachment asChild>
              <AuiIconButton tooltip="Adjuntar" size={BUTTON} side="top" sx={{ gridArea: 'att' }}><Plus /></AuiIconButton>
            </ComposerPrimitive.AddAttachment>
          ) : <Box sx={{ gridArea: 'att' }} />}
          <InlineInput ref={input} rows={1} placeholder={hasMessages ? followupPlaceholder : placeholder} aria-label="Mensaje para la IA" onKeyDown={onInputKey} />
          {canDictate ? (
            <Box sx={{ gridArea: 'mic' }}>
              <AuiIf condition={(s) => s.composer.dictation == null}>
                <ComposerPrimitive.Dictate asChild><AuiIconButton tooltip="Dictar" size={BUTTON} side="top"><Mic /></AuiIconButton></ComposerPrimitive.Dictate>
              </AuiIf>
              <AuiIf condition={(s) => s.composer.dictation != null}>
                <ComposerPrimitive.StopDictation asChild><AuiIconButton tooltip="Detener el dictado" size={BUTTON} side="top" aria-pressed sx={{ color: 'error.main' }}><Mic /></AuiIconButton></ComposerPrimitive.StopDictation>
              </AuiIf>
            </Box>
          ) : <Box sx={{ gridArea: 'mic' }} />}
          <Box sx={{ gridArea: 'send' }}>
            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send asChild>
                <AuiIconButton tooltip="Enviar" size={BUTTON} side="top" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' } }}><ArrowUp /></AuiIconButton>
              </ComposerPrimitive.Send>
            </AuiIf>
            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel asChild>
                <AuiIconButton tooltip="Detener la respuesta" size={BUTTON} side="top" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&& svg': { width: STOP, height: STOP } }}><Square fill="currentColor" /></AuiIconButton>
              </ComposerPrimitive.Cancel>
            </AuiIf>
          </Box>
        </Box>
      </ComposerPrimitive.Root>
      {!hasMessages && actions.length ? (
        <>
          <Divider />
          <MenuList ref={menu} aria-label="Acciones sugeridas" data-slot="aui-inline-prompt-actions" onKeyDown={onMenuKey} autoFocusItem={false}>
            {actions.map((a) => (
              <MenuItem key={a.title} onClick={() => send(a.title)}>
                {a.icon ? <ListItemIcon>{a.icon}</ListItemIcon> : null}
                {a.title}
              </MenuItem>
            ))}
          </MenuList>
        </>
      ) : null}
    </ThreadPrimitive.Root>
  );
}

const MarkdownPart: TextMessagePartComponent = () => <AuiMarkdownText />;

function InlineMessage() {
  const role = useAuiState((s) => s.message.role);
  if (role === 'user') {
    return (
      <Box component={MessagePrimitive.Root} sx={{ display: 'flex', justifyContent: 'flex-end', px: 1 }}>
        <Typography variant="body1" component="div" sx={{ maxWidth: '85%', px: 1.5, py: 0.75, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText', overflowWrap: 'anywhere' }}>
          <MessagePrimitive.Parts />
        </Typography>
      </Box>
    );
  }
  return (
    <Box component={MessagePrimitive.Root} sx={{ px: 1 }}>
      <Box sx={{ color: 'text.primary', overflowWrap: 'anywhere' }}>
        <MessagePrimitive.Parts components={{ Text: MarkdownPart }} />
      </Box>
      <Box component={ActionBarPrimitive.Root} hideWhenRunning autohide="never" sx={{ display: 'flex', gap: 0.5, ml: -0.5, pt: 0.5, color: 'text.secondary' }}>
        <ActionBarPrimitive.Copy asChild>
          <AuiIconButton tooltip="Copiar">
            <AuiIf condition={(s) => s.message.isCopied}><Check /></AuiIf>
            <AuiIf condition={(s) => !s.message.isCopied}><Copy /></AuiIf>
          </AuiIconButton>
        </ActionBarPrimitive.Copy>
        <ActionBarPrimitive.Reload asChild>
          <AuiIconButton tooltip="Regenerar"><RefreshCw /></AuiIconButton>
        </ActionBarPrimitive.Reload>
      </Box>
    </Box>
  );
}
