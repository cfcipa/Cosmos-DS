// Cosmos DS · Kit IA · AUI connected: Tool fallback.
// Referente: assistant-ui «Tool fallback» (elements/tool-fallback.aui.tsx), sobre el ToolCall y el ToolApproval del kit.
// El renderizador por defecto de una llamada a herramienta sin interfaz propia: la línea plegable «Herramienta usada:
// nombre» con su estado y duración, y al abrirla los argumentos, el error o el motivo de la cancelación, y el resultado.
// Cuando la herramienta espera a la persona se abre sola con la aprobación: Permitir / Rechazar, las opciones que
// declare la solicitud (con un paso de confirmación si la opción lo pide), o una pregunta con respuesta escrita. Si el
// runtime rechaza la respuesta, los controles vuelven con el error. Lo conectado aquí es la decisión; el dibujo es del kit.
import * as React from 'react';
import {
  toolApprovalAcceptsText, useAuiState, useToolCallElapsed,
  type ToolApprovalOption, type ToolCallMessagePart, type ToolCallMessagePartComponent, type ToolCallMessagePartProps, type ToolCallMessagePartStatus,
} from '@assistant-ui/react';
import { ToolApproval, ToolCall, type ToolApprovalOption as KitApprovalOption, type ToolCallStatus } from '../tool-call';

export const TOOL_APPROVED_RESULT = 'Aprobado por el usuario';
export const TOOL_DENIED_RESULT = 'El usuario rechazó la ejecución de la herramienta';
const OPTION_LABELS: Record<string, string> = {
  'allow-once': 'Permitir',
  'allow-always': 'Permitir siempre',
  'reject-once': 'Rechazar',
  'reject-always': 'Rechazar siempre',
};
/** Ids de las respuestas que no vienen de una opción declarada. */
const ALLOW_ID = '__allow';
const REJECT_ID = '__reject';

/** Texto de un valor cualquiera (resultado, error): tal cual si es texto, si no JSON. */
export function formatUnknownValue(value: unknown, space?: number): string {
  if (typeof value === 'string') return value;
  try {
    if (value instanceof Error) return String(value);
    const json = JSON.stringify(value, null, space);
    if (json !== undefined) return json;
  } catch { /* se intenta como texto */ }
  try { return String(value); } catch { return '[Valor no serializable]'; }
}

/** El estado del kit a partir del de la parte. */
export function toolCallStatus(status: ToolCallMessagePartStatus | undefined): ToolCallStatus {
  if (!status) return 'complete';
  if (status.type === 'running') return 'running';
  if (status.type === 'requires-action') return 'requires-action';
  if (status.type === 'incomplete') return status.reason === 'cancelled' ? 'cancelled' : 'error';
  return 'complete';
}

/** El error o el motivo de la cancelación de la parte, en texto. */
export function toolCallError(status: ToolCallMessagePartStatus | undefined): string | undefined {
  if (status?.type !== 'incomplete') return undefined;
  if (status.error !== undefined) return formatUnknownValue(status.error);
  return status.reason === 'cancelled' ? 'La ejecución se canceló.' : undefined;
}

// ——— Aprobación ———

type Approval = ToolCallMessagePart['approval'];
const isKnownKind = (kind: string) => Object.prototype.hasOwnProperty.call(OPTION_LABELS, kind);
const isAllowKind = (kind: string) => kind === 'allow-once' || kind === 'allow-always';
const optionLabel = (o: ToolApprovalOption) => o.label ?? (isKnownKind(o.kind) ? OPTION_LABELS[o.kind] : undefined) ?? o.id;
/** Una solicitud que declara cómo mostrarse hace una pregunta, no pide permiso: rechazarla no es una respuesta, salvo que sea descartable. */
const isQuestion = (approval: Approval) => approval?.display === 'select' || approval?.display === 'text';

/** Si hay algo que la persona pueda hacer aquí: una interrupción sin aprobación ni payload no ofrece acción. */
export function offersInterruptAction(status: ToolCallMessagePartStatus | undefined, approval: Approval, interrupt: ToolCallMessagePart['interrupt']) {
  return status?.type !== 'requires-action' || status.reason !== 'interrupt' || approval != null || interrupt != null;
}

export type AuiToolFallbackApprovalProps = Partial<Pick<ToolCallMessagePartProps, 'addResult' | 'resume' | 'respondToApproval' | 'status'>> & {
  interrupt?: ToolCallMessagePart['interrupt'];
  approval?: Approval;
};

export function AuiToolFallbackApproval({ addResult, resume, interrupt, approval, respondToApproval, status }: AuiToolFallbackApprovalProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const voiceActive = useAuiState((s) => s.thread.voice !== undefined);
  const locked = submitted || voiceActive;
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  if (approval != null && (approval.approved !== undefined || approval.resolution !== undefined)) return null;
  if (!offersInterruptAction(status, approval, interrupt)) return null;

  // Las opciones declaradas son una restricción del host: el kit no agrega caminos, y solo conserva el rechazo cuando
  // la solicitud es una acción que la persona puede negar.
  const declared = respondToApproval ? approval?.options : undefined;
  const acceptsText = approval != null && respondToApproval != null && toolApprovalAcceptsText(approval);
  const typedNote = () => (answer.trim() ? { text: answer } : {});
  // Una respuesta rechazada deja la solicitud abierta: los controles vuelven.
  const submit = (send: () => Promise<void> | void) => {
    setSubmitted(true);
    setError(null);
    void (async () => {
      try { await send(); } catch (e) { setSubmitted(false); setError(e instanceof Error ? e.message : String(e)); }
    })();
  };
  const respond = (approved: boolean) => {
    if (locked) return;
    if (approval != null && approval.approved === undefined && respondToApproval) submit(() => respondToApproval({ approved, ...typedNote() }));
    else if (interrupt) submit(() => resume?.({ approved }));
    else if (status?.type === 'requires-action' && status.reason === 'interrupt') return;
    else submit(() => addResult?.(approved ? TOOL_APPROVED_RESULT : TOOL_DENIED_RESULT));
  };
  const respondWithOption = (option: ToolApprovalOption) => {
    if (locked) return;
    // Un tipo propio no tiene clase de decisión: elegirlo es una respuesta, así que resuelve como aprobado.
    submit(() => respondToApproval?.(isKnownKind(option.kind) ? { optionId: option.id, ...typedNote() } : { optionId: option.id, approved: true, ...typedNote() }));
  };
  const submitAnswer = () => { if (!locked) submit(() => respondToApproval?.({ text: answer })); };
  // Descartar no es responder: el borrador no viaja.
  const dismiss = () => { if (!locked) submit(() => respondToApproval?.({ approved: false })); };
  const question = isQuestion(approval);
  const dismissible = question && respondToApproval != null && approval?.dismissible === true;

  // Una pregunta con respuesta escrita: el modo texto del kit (Enviar / Descartar si es descartable).
  if (question && acceptsText) {
    return (
      <ToolApproval
        mode="text"
        prompt={approval?.prompt}
        disabled={locked}
        error={error ?? undefined}
        answer={answer}
        onAnswerChange={setAnswer}
        dismissible={dismissible}
        onRespond={(id, text) => { if (id === 'submit') { setAnswer(text ?? ''); submitAnswer(); } else if (id === 'dismiss') dismiss(); }}
      />
    );
  }

  // Las opciones del kit: las declaradas (permitir, propias, rechazar) o Permitir / Rechazar.
  let options: KitApprovalOption[];
  if (declared && declared.length > 0) {
    const allow = declared.filter((o) => isAllowKind(o.kind));
    const custom = declared.filter((o) => !isKnownKind(o.kind));
    const reject = declared.filter((o) => isKnownKind(o.kind) && !isAllowKind(o.kind));
    options = [...allow, ...custom, ...reject].map((o) => {
      const meta = typeof o.confirm === 'object' ? o.confirm : undefined;
      return {
        id: o.id, label: optionLabel(o),
        kind: isAllowKind(o.kind) ? (o.kind === 'allow-always' ? 'allow-always' : 'allow') : isKnownKind(o.kind) ? 'reject' : 'allow',
        confirm: o.confirm ? { title: meta?.title ?? `¿${optionLabel(o)}?`, description: meta?.description ?? o.description, grants: o.grants ? [...o.grants] : undefined } : undefined,
      };
    });
    if (reject.length === 0 && !question) options.push({ id: REJECT_ID, label: 'Rechazar', kind: 'reject' });
  } else if (question) {
    options = [];
  } else {
    options = [{ id: ALLOW_ID, label: 'Permitir', kind: 'allow' }, { id: REJECT_ID, label: 'Rechazar', kind: 'reject' }];
  }
  if (dismissible) options.push({ id: 'dismiss', label: 'Descartar', kind: 'reject' });
  if (options.length === 0) return approval?.prompt ? <ToolApproval prompt={approval.prompt} options={[]} disabled={locked} error={error ?? undefined} /> : null;

  return (
    <ToolApproval
      prompt={approval?.prompt}
      options={options}
      disabled={locked}
      error={error ?? undefined}
      onRespond={(id) => {
        if (id === ALLOW_ID) respond(true);
        else if (id === REJECT_ID) respond(false);
        else if (id === 'dismiss') dismiss();
        else { const o = declared?.find((x) => x.id === id); if (o) respondWithOption(o); }
      }}
    />
  );
}

type PartProps = React.ComponentProps<ToolCallMessagePartComponent>;
export type AuiToolFallbackProps = Omit<PartProps, 'addResult' | 'resume' | 'respondToApproval'> & Partial<Pick<PartProps, 'addResult' | 'resume' | 'respondToApproval'>> & {
  /** Duración fija (demos); por defecto la del runtime. */
  elapsedMs?: number;
};

/** La llamada a herramienta completa: el ToolCall del kit con lo que trae la parte. Se abre sola al esperar a la persona. */
export const AuiToolFallback = React.memo(function AuiToolFallback({
  toolName, argsText, result, status, addResult, resume, interrupt, approval, respondToApproval, elapsedMs,
}: AuiToolFallbackProps) {
  const runtimeMs = useToolCallElapsed();
  const ms = elapsedMs ?? runtimeMs;
  const kitStatus = toolCallStatus(status);
  const showApproval = kitStatus === 'requires-action' && offersInterruptAction(status, approval, interrupt);
  return (
    <ToolCall
      toolName={toolName}
      status={kitStatus}
      args={argsText}
      result={result !== undefined ? formatUnknownValue(result, 2) : undefined}
      error={toolCallError(status)}
      durationMs={ms ?? undefined}
    >
      {showApproval ? (
        <AuiToolFallbackApproval addResult={addResult} resume={resume} interrupt={interrupt} approval={approval} respondToApproval={respondToApproval} status={status} />
      ) : null}
    </ToolCall>
  );
}) as unknown as ToolCallMessagePartComponent & React.FC<AuiToolFallbackProps>;
