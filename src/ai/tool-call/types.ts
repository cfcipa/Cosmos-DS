import type * as React from 'react';

export type ToolCallStatus = 'running' | 'requires-action' | 'complete' | 'error' | 'cancelled';

export interface ToolApprovalOption {
  id: string;
  label: string;
  /** 'reject' options never get a confirmation step. */
  kind?: 'allow' | 'allow-always' | 'reject';
  /** A second step before answering (e.g. «¿Permitir siempre?»). */
  confirm?: { title: string; description?: string; grants?: string[] };
}

export interface ToolApprovalProps {
  /** The question, one line: «¿Confirmo 2 facturas por $ 7.430.000?». */
  prompt?: string;
  /** Buttons in order; the first is contained, the rest outlined. Default Aprobar / Rechazar. */
  options?: ToolApprovalOption[];
  /** 'buttons' (default) or 'text' = a free answer with Enviar / Descartar. */
  mode?: 'buttons' | 'text';
  /** Called with the option id, or 'submit' + the answer / 'dismiss' in text mode. */
  onRespond?: (id: string, answer?: string) => void;
  /** Locks every control while the answer is being sent. */
  disabled?: boolean;
  /** An error under the controls (role=alert). */
  error?: string;
  /** Text mode answer: controlled / uncontrolled. */
  answer?: string;
  defaultAnswer?: string;
  onAnswerChange?: (text: string) => void;
  /** Default 'Respuesta'. */
  fieldLabel?: string;
  /** Default 'Escribe tu respuesta'. */
  placeholder?: string;
  /** Default 'Enviar'. */
  submitLabel?: string;
  /** Default 'Descartar'. */
  dismissLabel?: string;
  /** Default 'Confirmar'. */
  confirmLabel?: string;
  /** Default 'Volver'. */
  backLabel?: string;
  /** Shown when Enviar is pressed with an empty answer. Default 'La respuesta no puede estar vacía.' */
  emptyError?: string;
}

export interface ToolCallProps {
  /** The tool's name, shown in bold: «confirmar_facturas». */
  toolName: string;
  /** Default 'complete'. requires-action keeps the body open and shows `approval`. */
  status?: ToolCallStatus;
  /** Arguments: a string (shown as is) or an object (pretty-printed JSON). */
  args?: string | object;
  /** Result, shown under «Resultado:» once there is one. */
  result?: string | object;
  /** Error or cancellation reason (status error / cancelled). */
  error?: string;
  /** Elapsed time; formatted «1,2s». */
  durationMs?: number;
  /** While running without durationMs: epoch ms the call started, the duration ticks live. */
  startedAt?: number;
  /** Expanded body: controlled / uncontrolled. Default collapsed. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Approval block for requires-action. */
  approval?: ToolApprovalProps;
  /** Extra body content (a tool's own UI) after the args. */
  children?: React.ReactNode;
  /** Default 'Herramienta usada'. */
  usedLabel?: string;
  /** Default 'Herramienta cancelada'. */
  cancelledLabel?: string;
  /** Default 'Requiere aprobación'. */
  requiresActionLabel?: string;
  /** Default 'Error:'. */
  errorTitle?: string;
  /** Default 'Motivo de la cancelación:'. */
  cancelTitle?: string;
  /** Default 'Resultado:'. */
  resultLabel?: string;
  className?: string;
}

export interface ToolGroupProps {
  /** Tool calls in the group (the trigger label: «2 llamadas a herramientas»). */
  count: number;
  /** Some call in the group is running: 12px spinner and shimmer on the label. */
  active?: boolean;
  /** 'ghost' (the Thread's: no frame, secondary text), 'outline' (bordered) or 'muted' (bordered, grey surface). Default 'outline'. */
  variant?: 'outline' | 'ghost' | 'muted';
  /** Expanded: controlled / uncontrolled. Default collapsed. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The trigger label. Default «1 llamada a herramienta» / «N llamadas a herramientas». */
  label?: (count: number) => string;
  /** The ToolCall parts of the group, in order. */
  children?: React.ReactNode;
  className?: string;
}


/** «<1s», «1,2s», «12s», «1m 5s». */
export function formatToolDuration(ms: number): string {
  if (ms < 1000) return '<1s';
  const s = ms / 1000;
  if (s < 10) return (Math.floor(s * 10) / 10).toFixed(1).replace('.', ',') + 's';
  if (s < 60) return Math.floor(s) + 's';
  return Math.floor(s / 60) + 'm ' + Math.floor(s % 60) + 's';
}
