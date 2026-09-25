// Cosmos DS · Kit IA · AUI connected: Thread.
// Referente: assistant-ui «Thread» (elements/thread.aui.tsx), conectado al runtime de @assistant-ui/react.
// Un contenedor de chat completo: bienvenida con el composer centrado y sugerencias debajo; al enviar, el composer se
// acopla abajo y el hilo sigue la respuesta. El usuario edita en su lugar (Cancelar / Actualizar); cada respuesta
// tiene copiar, regenerar y «Más» (exportar como Markdown), ocultos mientras corre y siempre visibles en la última;
// con varias versiones aparece «n / m». Ir al final se desactiva cuando ya estás abajo. Enviar pasa a detener.
// Las respuestas llevan formato (Markdown) y su razonamiento en un visor plegable. Opcionales: el tiempo del mensaje en
// la barra de acciones (`messageTiming`), el uso del contexto en el composer (`modelContextWindow`) y el mapa de la
// conversación junto al hilo (`conversationMap`).
// Lo visual es el del kit: mientras la respuesta no llega, el «Thinking indicator» nombra lo que el asistente hace
// («Pensando», «Ejecutando consultar_obligaciones») con el tiempo transcurrido; el texto llega como «Streaming text»; las acciones son «Message actions», las versiones el stepper de «Message branches», el mensaje del
// usuario se edita con «Edit message» (la burbuja es la de los tableros), el error es «Error state» y una respuesta detenida lleva «Stopped run».
import * as React from 'react';
import {
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  ComposerPrimitive,
  groupPartByType,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  type FileMessagePartComponent,
  type ImageMessagePartComponent,
  type ToolCallMessagePartComponent,
  useAui,
  useAuiState,
} from '@assistant-ui/react';
import {
  useActionBarCopy, useActionBarFeedbackNegative, useActionBarFeedbackPositive, useActionBarReload,
  useBranchPickerNext, useBranchPickerPrevious, useComposerCancel, useComposerSend, useEditComposerCancel, useEditComposerSend, useMessageError,
} from '@assistant-ui/core/react';
import Box from '@mui/material/Box';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { keyframes, styled } from '@mui/material/styles';
import { Download, Mic, Pencil, Square } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { riseSx } from '../lib/thread';
import { Composer as KitComposer } from '../composer';
import { EditMessage } from '../edit-message';
import { EmptyStateGreeting, EmptyStateSuggestion, EmptyStateSuggestions } from '../empty-state';
import { ErrorState } from '../error-state';
import { MessageActions } from '../message-actions';
import { MessageBranchesStepper } from '../message-branches';
import { ScrollAnchorButton } from '../scroll-anchor';
import { STOPPED_RUN_REASONS, StoppedRunActions } from '../stopped-run';
import { ThinkingIndicator, useThinkingElapsed } from '../thinking-indicator';
import { AuiIconButton } from './AuiIconButton';
import { AuiComposerAddAttachment, AuiComposerAttachments, AuiUserMessageAttachments } from './Attachment';
import { AuiFollowupSuggestions } from './FollowupSuggestions';
import { AuiContextDisplayRing } from './ContextDisplay';
import { AuiConversationMapRail } from './ConversationMap';
import { AuiMarkdownText } from './MarkdownText';
import { AuiMessageTiming, AuiMessageTimingFooter } from './MessageTiming';
import { AuiReasoningGroup } from './Reasoning';
import { AuiToolFallback } from './ToolFallback';
import { AuiToolGroupContent, AuiToolGroupRoot, AuiToolGroupTrigger } from './ToolGroup';
import { AuiComposerQuotePreview, AuiQuoteBlock, AuiSelectionToolbar, AUI_QUOTE_ACTIONS } from './Quote';
import { AuiSources } from './Sources';
import { AuiImage } from './Image';
import { AuiFile } from './File';
import { AuiModelSelector, type AuiModelSelectorProps } from './ModelSelector';
import { createAuiDirectiveText, type AuiDirectiveTextOptions } from './DirectiveText';
import { AuiSelectionContextChip, AuiSelectionContextMessageChip, useAuiSelectionContext } from './SelectionContext';

export type AuiThreadTiming = { design?: 'badge' | 'footer'; side?: 'top' | 'right' | 'bottom' | 'left' };

export type AuiThreadComponents = {
  AssistantMessage?: React.ComponentType;
  Welcome?: React.ComponentType;
  ToolFallback?: ToolCallMessagePartComponent;
};

export interface AuiThreadProps {
  components?: AuiThreadComponents;
  /** Enfoca el composer al montar, al empezar una ejecución y al cambiar de hilo. Default true. */
  autoFocus?: boolean;
  /** Default '¿En qué te ayudo hoy?'. */
  welcome?: string;
  /** Default 'Escribe un mensaje…'. */
  placeholder?: string;
  /** Tiempos de cada respuesta: la insignia en la barra de acciones (`true` o `{ design: 'badge', side }`) o el pie
   * de estadísticas bajo el texto (`{ design: 'footer' }`). */
  messageTiming?: boolean | AuiThreadTiming;
  /** Ventana de contexto del modelo, en tokens: muestra el anillo de uso en el composer. */
  modelContextWindow?: number;
  /** Muestra el mapa de la conversación a un lado del hilo. `true` = izquierda. */
  conversationMap?: boolean | 'left' | 'right';
  /** Barra para citar el texto seleccionado de un mensaje. `true` = solo «Citar»; `'actions'` suma Explicar y Reescribir. */
  quotes?: boolean | 'actions';
  /** Las sugerencias de seguimiento se envían al tocarlas (default) o solo llenan el composer. */
  followupSend?: boolean;
  /** Selectores de carácter del composer (`AuiComposerTriggerPopover` para @ y /). */
  triggers?: React.ReactNode;
  /** Muestra las menciones de los mensajes del usuario como fichas (`true`, o con íconos por tipo). */
  directives?: boolean | AuiDirectiveTextOptions;
  /** El selector de modelo en el composer. */
  modelSelector?: AuiModelSelectorProps;
  /** Lo que muestra el chat vacío sobre el composer (p. ej. `AuiStarterSuggestions`), en lugar de la bienvenida y sus
   * sugerencias. El composer queda abajo. */
  empty?: React.ReactNode;
  /** Una línea al comienzo del hilo cuando ya hay mensajes (p. ej. que las respuestas se generan con IA). */
  disclaimer?: string;
}

type PlaceholderPreview = { preview: string | null; setPreview: (text: string | null) => void };
const PlaceholderPreviewContext = React.createContext<PlaceholderPreview>({ preview: null, setPreview: () => undefined });
/** Anticipa un texto en el placeholder del composer (las sugerencias de inicio al pasar por encima). */
export function useAuiComposerPlaceholderPreview() {
  return React.useContext(PlaceholderPreviewContext);
}

/** Medidas de assistant-ui: columna de 44rem, composer con 8px de relleno, botones de 28px, íconos de 16px. */
const THREAD_MAX_WIDTH = 704;
const SEND = 3.5;
const ICON_SIZE = 16;
const STOP_SIZE = 14;
/** Espacio que reserva la barra de acciones bajo cada respuesta (min-h-7.5). */
const ACTION_BAR = 3.75;
/** Tiempo que «Copiar» muestra la marca (useCopyToClipboard de assistant-ui). */
const COPIED_MS = 3000;
/** Con el mapa de la conversación, el hilo deja libre su riel (24px más 12px a cada lado). */
const MAP_GUTTER = 6;

const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: .35; }`;

const ComponentsContext = React.createContext<AuiThreadComponents>({});
type ThreadOptions = { welcome: string; placeholder: string; timing?: AuiThreadTiming; modelContextWindow?: number; triggers?: React.ReactNode; directives?: boolean | AuiDirectiveTextOptions; modelSelector?: AuiModelSelectorProps };
const LabelsContext = React.createContext<ThreadOptions>({ welcome: '¿En qué te ayudo hoy?', placeholder: 'Escribe un mensaje…' });

// Al arrancar, el hilo de carga cuenta como chat nuevo (composer centrado); cambiar a un hilo que aún trae su
// historial muestra el esqueleto, no la bienvenida.
const isNewChatView = (s: AssistantState) => s.thread.messages.length === 0 && (!s.thread.isLoading || s.threads.isLoading);
const isHistoryLoadingView = (s: AssistantState) => s.thread.messages.length === 0 && s.thread.isLoading && !s.thread.isDisabled && !s.threads.isLoading;

const messageGroupBy = groupPartByType({
  reasoning: ['group-chainOfThought', 'group-reasoning'],
  'tool-call': ['group-chainOfThought', 'group-tool'],
  'standalone-tool-call': [],
});

const Root = styled(ThreadPrimitive.Root)(({ theme: t }) => ({ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: t.palette.background.paper }));
const Viewport = styled(ThreadPrimitive.Viewport)({ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column', overflowX: 'auto', overflowY: 'scroll', scrollBehavior: 'smooth' });
const ViewportFooter = styled(ThreadPrimitive.ViewportFooter)(({ theme: t }) => ({
  display: 'flex', flexDirection: 'column', gap: t.spacing(2), paddingBottom: t.spacing(2), backgroundColor: t.palette.background.paper,
  '&[data-docked="true"]': { position: 'sticky', bottom: 0, marginTop: 'auto' },
  [t.breakpoints.up('md')]: { paddingBottom: t.spacing(3) },
}));

export function AuiThread({
  components = {}, autoFocus = true, welcome = '¿En qué te ayudo hoy?', placeholder = 'Escribe un mensaje…', messageTiming = false, modelContextWindow, conversationMap, quotes = false, followupSend = true, triggers, directives, modelSelector,
  empty, disclaimer,
}: AuiThreadProps) {
  const isNew = useAuiState(isNewChatView);
  const hasEmpty = empty !== undefined;
  // Con `empty`, el chat vacío no centra el composer: lo deja abajo con lo que se muestre encima.
  const isEmpty = isNew && !hasEmpty;
  const [preview, setPreview] = React.useState<string | null>(null);
  const previewValue = React.useMemo(() => ({ preview, setPreview }), [preview]);
  const timingDesign = messageTiming === true ? 'badge' : messageTiming ? messageTiming.design ?? 'badge' : undefined;
  const timingSide = typeof messageTiming === 'object' ? messageTiming.side : undefined;
  const labels = React.useMemo(
    () => ({ welcome, placeholder, timing: timingDesign ? { design: timingDesign, side: timingSide } : undefined, modelContextWindow, triggers, directives, modelSelector }),
    [welcome, placeholder, timingDesign, timingSide, modelContextWindow, triggers, directives, modelSelector],
  );
  const mapSide = conversationMap === true ? 'left' : conversationMap || undefined;
  const Welcome = components.Welcome ?? ThreadWelcome;
  return (
    <ComponentsContext.Provider value={components}>
      <LabelsContext.Provider value={labels}>
        <PlaceholderPreviewContext.Provider value={previewValue}>
          <Root data-slot="aui-thread">
            <Viewport turnAnchor="top" data-slot="aui-thread-viewport">
              {mapSide ? <AuiConversationMapRail side={mapSide} /> : null}
              <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: THREAD_MAX_WIDTH, boxSizing: 'border-box', px: 2, pt: 2, ...(mapSide ? { [mapSide === 'left' ? 'pl' : 'pr']: MAP_GUTTER } : null), justifyContent: isEmpty ? 'center' : undefined }}>
                {disclaimer ? (
                  <AuiIf condition={(s) => s.thread.messages.length > 0}>
                    <Typography variant="caption" component="p" color="text.secondary" align="center" sx={{ m: 0, mb: 2 }}>{disclaimer}</Typography>
                  </AuiIf>
                ) : null}
                {hasEmpty ? null : <AuiIf condition={isNewChatView}><Welcome /></AuiIf>}
                <AuiIf condition={isHistoryLoadingView}><HistorySkeleton /></AuiIf>
                <Stack spacing={3} data-slot="aui-message-group" sx={{ mb: 7, '&:empty': { display: 'none' } }}>
                  <ThreadPrimitive.Messages>{() => <ThreadMessage />}</ThreadPrimitive.Messages>
                </Stack>
                <ViewportFooter data-docked={!isEmpty}>
                  <ScrollToBottom />
                  <AuiFollowupSuggestions send={followupSend} />
                  {hasEmpty ? <AuiIf condition={isNewChatView}>{empty}</AuiIf> : null}
                  <Composer autoFocus={autoFocus} />
                  {hasEmpty ? null : <AuiIf condition={(s) => isNewChatView(s) && s.composer.isEmpty}><WelcomeSuggestions /></AuiIf>}
                </ViewportFooter>
              </Box>
              {quotes ? <AuiSelectionToolbar actions={quotes === 'actions' ? AUI_QUOTE_ACTIONS : undefined} /> : null}
            </Viewport>
          </Root>
        </PlaceholderPreviewContext.Provider>
      </LabelsContext.Provider>
    </ComponentsContext.Provider>
  );
}

function HistorySkeleton() {
  return (
    <Stack spacing={3} role="status" sx={(t) => riseSx(t, 150)}>
      <Box component="span" sx={visuallyHidden}>Cargando la conversación</Box>
      <Skeleton variant="rounded" sx={{ ml: 'auto', width: '40%', height: (t) => t.spacing(4.5) }} />
      <Stack spacing={1}><Skeleton width="92%" /><Skeleton width="80%" /><Skeleton width="60%" /></Stack>
      <Skeleton variant="rounded" sx={{ ml: 'auto', width: '33%', height: (t) => t.spacing(4.5) }} />
      <Stack spacing={1}><Skeleton width="83%" /><Skeleton width="66%" /></Stack>
    </Stack>
  );
}

function ThreadWelcome() {
  const { welcome } = React.useContext(LabelsContext);
  return <Box sx={{ mb: 3, px: 1 }}><EmptyStateGreeting sx={{ textAlign: 'start' }}>{welcome}</EmptyStateGreeting></Box>;
}

/** Una sugerencia del runtime como ficha del «Empty state»: al tocarla llena el composer con su prompt. */
function WelcomeSuggestion() {
  const label = useAuiState((s) => s.suggestion.title || s.suggestion.prompt);
  const index = useAuiState((s) => s.suggestions.suggestions.findIndex((x) => x.prompt === s.suggestion.prompt && x.title === s.suggestion.title));
  return (
    <SuggestionPrimitive.Trigger asChild>
      <EmptyStateSuggestion label={label} index={index} />
    </SuggestionPrimitive.Trigger>
  );
}

function WelcomeSuggestions() {
  return (
    <EmptyStateSuggestions sx={{ justifyContent: 'flex-start', px: 1 }}>
      <ThreadPrimitive.Suggestions>{() => <WelcomeSuggestion />}</ThreadPrimitive.Suggestions>
    </EmptyStateSuggestions>
  );
}

/** El botón del «Scroll anchor»: cuenta los mensajes que llegan mientras la vista no está abajo. */
const ScrollAnchorTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof ScrollAnchorButton>>(function ScrollAnchorTrigger({ disabled, unseen: _unseen, ...props }, ref) {
  const count = useAuiState((s) => s.thread.messages.length);
  const seen = React.useRef(count);
  if (disabled) seen.current = count;
  return <ScrollAnchorButton ref={ref} unseen={count - seen.current} {...props} sx={{ visibility: disabled ? 'hidden' : 'visible' }} />;
});

function ScrollToBottom() {
  return (
    <Box sx={(t) => ({ position: 'absolute', top: t.spacing(-6), left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1, pointerEvents: 'none' })}>
      <ThreadPrimitive.ScrollToBottom asChild>
        <ScrollAnchorTrigger unseen={0} />
      </ThreadPrimitive.ScrollToBottom>
    </Box>
  );
}

/** `ComposerPrimitive.Input` como textarea del OutlinedInput: el marco no controla el valor (es del runtime), así que su
 * `value` vacío no lo pisa. */
const ConnectedInput = React.forwardRef<HTMLTextAreaElement, InputBaseComponentProps>(function ConnectedInput({ value: _value, defaultValue: _default, ...props }, ref) {
  return <ComposerPrimitive.Input ref={ref} {...(props as React.ComponentProps<typeof ComposerPrimitive.Input>)} />;
});

/** El composer del kit sobre las primitivas: el textarea es `ComposerPrimitive.Input` (texto, Enter, IME, foco y dictado
 * son del runtime), enviar y detener llaman al runtime, y soltar archivos los adjunta. */
function Composer({ autoFocus }: { autoFocus: boolean }) {
  const { placeholder, modelContextWindow, triggers, modelSelector } = React.useContext(LabelsContext);
  const { preview } = React.useContext(PlaceholderPreviewContext);
  const aui = useAui();
  const { send, disabled: sendDisabled } = useComposerSend();
  const { cancel } = useComposerCancel();
  const running = useAuiState((s) => s.composer.canCancel && (s.thread.voice === undefined || s.composer.submission !== undefined));
  const disabled = useAuiState((s) => s.thread.isDisabled);
  const hasAdornments = useAuiState((s) => s.composer.attachments.length > 0 || s.composer.quote !== undefined);
  const selection = useAuiSelectionContext();
  const canDictate = useAuiState((s) => s.thread.capabilities.dictation);
  const dictating = useAuiState((s) => s.composer.dictation != null);
  const inputProps = React.useMemo(() => ({ autoFocus, enterKeyHint: 'send' as const, 'data-preview': preview !== null }), [autoFocus, preview]);
  return (
    <ComposerPrimitive.Unstable_TriggerPopoverRoot>
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }} data-slot="aui-composer">
        {triggers}
        <KitComposer
          inputComponent={ConnectedInput}
          inputProps={inputProps}
          submitMode="none"
          placeholder={preview ?? placeholder}
          previewing={preview !== null}
          minRows={1}
          onSubmit={send}
          canSubmit={!sendDisabled}
          running={running}
          onCancel={cancel}
          disabled={disabled}
          onFilesDrop={(files) => files.forEach((file) => { void aui.composer().addAttachment(file); })}
          attachments={hasAdornments || selection?.active ? <><AuiSelectionContextChip /><AuiComposerAttachments /><AuiComposerQuotePreview /></> : undefined}
          toolbarStart={
            <>
              <AuiComposerAddAttachment />
              {modelSelector ? <AuiModelSelector size="sm" variant="ghost" {...modelSelector} /> : null}
            </>
          }
          toolbarEnd={
            <>
              {modelContextWindow ? <AuiContextDisplayRing modelContextWindow={modelContextWindow} /> : null}
              {canDictate && !dictating ? (
                <ComposerPrimitive.Dictate asChild>
                  <AuiIconButton tooltip="Dictar" size={SEND}><Mic /></AuiIconButton>
                </ComposerPrimitive.Dictate>
              ) : null}
              {canDictate && dictating ? (
                <ComposerPrimitive.StopDictation asChild>
                  <AuiIconButton tooltip="Detener el dictado" size={SEND} sx={{ color: 'error.main' }}>
                    <Box component="span" sx={{ display: 'flex', animation: `${pulse} 1.2s infinite`, [REDUCED_MOTION]: { animation: 'none' } }}><Square size={STOP_SIZE} fill="currentColor" /></Box>
                  </AuiIconButton>
                </ComposerPrimitive.StopDictation>
              ) : null}
            </>
          }
        />
      </Box>
    </ComposerPrimitive.Unstable_TriggerPopoverRoot>
  );
}

function ThreadMessage() {
  const { AssistantMessage: Assistant = AssistantMessage } = React.useContext(ComponentsContext);
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);
  if (isEditing) return <EditComposer />;
  if (role === 'user') return <UserMessage />;
  return <Assistant />;
}

/** El error de la respuesta, con «Reintentar» (vuelve a generarla). */
function MessageError() {
  const error = useMessageError();
  const { reload } = useActionBarReload();
  if (error === undefined) return null;
  return <Box sx={{ mt: 1 }}><ErrorState detail={String(error)} retrying={false} onRetry={reload} /></Box>;
}

/** Una respuesta detenida (por ti o por longitud): el motivo y «Continuar» (vuelve a generarla). */
function MessageStopped() {
  const reason = useAuiState((s) => (s.message.status?.type === 'incomplete' ? s.message.status.reason : undefined));
  const { reload, disabled } = useActionBarReload();
  const label = reason === 'cancelled' ? STOPPED_RUN_REASONS.user : reason === 'length' ? STOPPED_RUN_REASONS.length : undefined;
  if (!label) return null;
  return <Box sx={{ mt: 1.5 }}><StoppedRunActions reason={label} onContinue={disabled ? undefined : reload} /></Box>;
}

/** Lo que el asistente hace ahora: la herramienta que corre, o pensar. */
const thinkingLabel = (s: AssistantState) => {
  const running = [...s.message.parts].reverse().find((p) => p.type === 'tool-call' && p.status.type === 'running');
  return running && running.type === 'tool-call' ? `Ejecutando ${running.toolName}` : 'Pensando';
};

/** Mientras la respuesta no llega: el «Thinking indicator» del kit, con lo que hace y el tiempo que lleva. */
function WaitingIndicator() {
  const label = useAuiState(thinkingLabel);
  const elapsed = useThinkingElapsed(true);
  return <ThinkingIndicator label={label} elapsed={elapsed} />;
}

/** El texto de la respuesta, con formato. */
function TextPart() {
  return <Box sx={{ '& + &': { mt: 1.5 } }}><AuiMarkdownText /></Box>;
}

const DefaultToolFallback: ToolCallMessagePartComponent = (part) => <AuiToolFallback {...part} />;

/** El grupo de herramientas del hilo (ghost). Se abre solo cuando una llamada espera a la persona, como la llamada misma. */
function ToolGroupPart({ count, status, children }: { count: number; status: string; children: React.ReactNode }) {
  const waiting = status === 'requires-action';
  const [open, setOpen] = React.useState(waiting);
  const [prev, setPrev] = React.useState(waiting);
  if (waiting !== prev) {
    setPrev(waiting);
    if (waiting) setOpen(true);
  }
  return (
    <AuiToolGroupRoot variant="ghost" open={open} onOpenChange={setOpen}>
      <AuiToolGroupTrigger count={count} active={status === 'running'} />
      <AuiToolGroupContent>{children}</AuiToolGroupContent>
    </AuiToolGroupRoot>
  );
}

function AssistantMessage() {
  const { ToolFallback = DefaultToolFallback } = React.useContext(ComponentsContext);
  const { timing } = React.useContext(LabelsContext);
  return (
    <Box
      component={MessagePrimitive.Root}
      data-slot="aui-assistant-message"
      data-role="assistant"
      sx={(t) => ({ position: 'relative', mb: -ACTION_BAR, pb: ACTION_BAR, ...riseSx(t) })}
    >
      <Box sx={{ px: 1, color: 'text.primary', overflowWrap: 'anywhere' }}>
        <MessagePrimitive.GroupedParts groupBy={messageGroupBy}>
          {({ part, children }) => {
            switch (part.type) {
              case 'group-chainOfThought':
                return <div data-slot="aui-chain-of-thought">{children}</div>;
              case 'group-tool':
                return <ToolGroupPart count={part.indices.length} status={part.status.type}>{children}</ToolGroupPart>;
              case 'group-reasoning':
                return <AuiReasoningGroup streaming={part.status.type === 'running'}>{children}</AuiReasoningGroup>;
              case 'text':
                return <TextPart />;
              case 'reasoning':
                return <AuiMarkdownText />;
              case 'tool-call':
                return part.toolUI ?? <ToolFallback {...part} />;
              case 'data':
                return part.dataRendererUI;
              case 'image':
                return <Box sx={{ py: 0.5 }} data-slot="aui-assistant-image"><AuiImage {...part} /></Box>;
              case 'source':
                return <AuiSources {...part} />;
              case 'file':
                return <Box sx={{ py: 0.5 }} data-slot="aui-assistant-file"><AuiFile {...part} /></Box>;
              case 'indicator':
                return <WaitingIndicator />;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
        <MessageStopped />
        {timing?.design === 'footer' ? <AuiMessageTimingFooter sx={{ mt: 1.5 }} /> : null}
      </Box>
      <Stack direction="row" alignItems="center" sx={(t) => ({ ml: 1, minHeight: t.spacing(ACTION_BAR), pt: 0.75 })}>
        <BranchPicker />
        <AssistantActionBar />
      </Stack>
    </Box>
  );
}

const ActionBarRoot = styled(ActionBarPrimitive.Root)(({ theme: t }) => ({ display: 'flex', alignItems: 'center', gap: t.spacing(0.5) }));

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

/** Las acciones de la respuesta: «Message actions» del kit, con «Más» → Exportar como Markdown. */
function AssistantActionBar() {
  const { timing } = React.useContext(LabelsContext);
  const copy = useActionBarCopy({ copiedDuration: COPIED_MS, copyToClipboard });
  const { reload } = useActionBarReload();
  const positive = useActionBarFeedbackPositive();
  const negative = useActionBarFeedbackNegative();
  const feedback = useAuiState((s) => s.thread.capabilities.feedback);
  const [more, setMore] = React.useState<HTMLElement | null>(null);
  const close = () => setMore(null);
  return (
    <ActionBarRoot hideWhenRunning autohide="not-last">
      <MessageActions
        copied={copy.isCopied}
        reaction={positive.isSubmitted ? 'up' : negative.isSubmitted ? 'down' : null}
        regenerating={false}
        reactions={feedback}
        onCopy={copy.copy}
        onReactionChange={(r) => { if (r === 'up') positive.submit(); else if (r === 'down') negative.submit(); }}
        onRegenerate={reload}
        onMore={setMore}
        moreOpen={more !== null}
      />
      <Menu anchorEl={more} open={more !== null} onClose={close}>
        <ActionBarPrimitive.ExportMarkdown asChild>
          <MenuItem onClick={close}><ListItemIcon><Download size={ICON_SIZE} /></ListItemIcon>Exportar como Markdown</MenuItem>
        </ActionBarPrimitive.ExportMarkdown>
      </Menu>
      {timing?.design === 'badge' ? <AuiMessageTiming side={timing.side} /> : null}
    </ActionBarRoot>
  );
}

const UserImagePart: ImageMessagePartComponent = (part) => <Box sx={{ py: 0.5 }}><AuiImage {...part} /></Box>;

const UserFilePart: FileMessagePartComponent = (part) => <Box sx={{ py: 0.5 }}><AuiFile {...part} /></Box>;

/** Las partes del mensaje del usuario; con `directives`, las menciones como fichas. */
function UserParts() {
  const { directives } = React.useContext(LabelsContext);
  const Text = React.useMemo(() => (directives ? createAuiDirectiveText(undefined, directives === true ? {} : directives) : undefined), [directives]);
  return <MessagePrimitive.Parts components={{ Image: UserImagePart, File: UserFilePart, ...(Text ? { Text } : {}) }} />;
}

function UserMessage() {
  return (
    <Box
      component={MessagePrimitive.Root}
      data-slot="aui-user-message"
      data-role="user"
      sx={(t) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, px: 1, ...riseSx(t) })}
    >
      <AuiUserMessageAttachments />
      <Box sx={{ '&:empty': { display: 'none' } }}><AuiSelectionContextMessageChip /></Box>
      {/* La burbuja de los tableros (12px 16px, hasta el 85 %), con «Editar» a su izquierda al pasar. */}
      <Box
        sx={(t) => ({
          position: 'relative', minWidth: 0, maxWidth: '85%',
          '& [data-slot="aui-user-actions"]': { opacity: 0, transition: t.transitions.create('opacity', { duration: t.transitions.duration.shortest }) },
          '&:hover [data-slot="aui-user-actions"], &:focus-within [data-slot="aui-user-actions"]': { opacity: 1 },
        })}
      >
        <Typography variant="body1" component="div" sx={{ px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText', overflowWrap: 'anywhere', '&:empty': { display: 'none' } }}>
          <MessagePrimitive.Quote>{(quote) => <AuiQuoteBlock {...quote} />}</MessagePrimitive.Quote>
          <UserParts />
        </Typography>
        <Box sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translate(-100%, -50%)', pr: 1 }}>
          <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" data-slot="aui-user-actions">
            <ActionBarPrimitive.Edit asChild>
              <AuiIconButton tooltip="Editar"><Pencil /></AuiIconButton>
            </ActionBarPrimitive.Edit>
          </ActionBarPrimitive.Root>
        </Box>
      </Box>
      <BranchPicker user />
    </Box>
  );
}

/** La edición en su lugar: «Edit message» del kit, con cuántas respuestas descarta. */
function EditComposer() {
  const aui = useAui();
  const value = useAuiState((s) => s.composer.text);
  const discarded = useAuiState((s) => s.thread.messages.slice(s.message.index + 1).filter((m) => m.role === 'assistant').length);
  const { send } = useEditComposerSend();
  const { cancel } = useEditComposerCancel();
  return (
    <Box component={MessagePrimitive.Root} data-slot="aui-edit-composer" sx={{ px: 1 }}>
      <EditMessage value={value} editing discardedReplies={discarded} onValueChange={(v) => aui.composer().setText(v)} onSave={send} onCancel={cancel} />
    </Box>
  );
}

/** Las versiones del mensaje: el stepper de «Message branches» del kit. */
function BranchPicker({ user = false, sx }: { user?: boolean; sx?: React.ComponentProps<typeof Box>['sx'] }) {
  const number = useAuiState((s) => s.message.branchNumber);
  const count = useAuiState((s) => s.message.branchCount);
  const previous = useBranchPickerPrevious();
  const next = useBranchPickerNext();
  if (count <= 1) return null;
  return (
    <Box sx={[{ display: 'flex', mr: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <MessageBranchesStepper
        index={number - 1}
        count={count}
        onPrevious={previous.previous}
        onNext={next.next}
        previousDisabled={previous.disabled}
        nextDisabled={next.disabled}
        previousLabel={user ? 'Ver el mensaje anterior' : undefined}
        nextLabel={user ? 'Ver el mensaje siguiente' : undefined}
      />
    </Box>
  );
}
