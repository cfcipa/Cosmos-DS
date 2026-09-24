import * as React from 'react';
import { LoaderDoc, LoaderCard } from './elements/Loader';
import { ThinkingIndicatorDoc, ThinkingIndicatorCard } from './elements/ThinkingIndicator';
import { StreamingTextDoc, StreamingTextCard } from './elements/StreamingText';
import { TypingIndicatorDoc, TypingIndicatorCard } from './elements/TypingIndicator';
import { ReasoningEffortDoc, ReasoningEffortCard } from './elements/ReasoningEffort';
import { MessagePairDoc, MessagePairCard } from './elements/MessagePair';

export interface ElementEntry {
  slug: string;
  title: string;
  description: string;
  /** Vista previa en la tarjeta de Elements. */
  Card: React.ComponentType;
  /** Página del elemento: probar, usar en tu producto, cómo está hecho, guía y props. */
  Doc: React.ComponentType;
}
export interface Section { id: string; title: string; elements: ElementEntry[] }

/** Secciones en el orden del catálogo Elements de assistant-ui.  */
export const SECTIONS: Section[] = [
  {
    id: 'reasoning', title: 'Reasoning', elements: [
      { slug: 'loader', title: 'Loader', description: 'El símbolo de Sinco marca el tiempo mientras el modelo todavía no tiene nada que mostrar.', Card: LoaderCard, Doc: LoaderDoc },
      { slug: 'thinking-indicator', title: 'Thinking indicator', description: 'Una línea viva que nombra lo que el asistente hace ahora mismo, con el tiempo transcurrido.', Card: ThinkingIndicatorCard, Doc: ThinkingIndicatorDoc },
      { slug: 'streaming-text', title: 'Streaming text', description: 'Las palabras llegan suave: las más nuevas entran en azul y se asientan en tinta.', Card: StreamingTextCard, Doc: StreamingTextDoc },
      { slug: 'typing-indicator', title: 'Typing indicator', description: 'Tres puntos que se leen como presencia, no como ruido, justo donde aparecerá la respuesta.', Card: TypingIndicatorCard, Doc: TypingIndicatorDoc },
      { slug: 'reasoning-effort', title: 'Reasoning effort', description: 'Cuánto pensar, y cuánto de ese presupuesto gastó de verdad la ejecución.', Card: ReasoningEffortCard, Doc: ReasoningEffortDoc },
    ],
  },
  {
    id: 'messages', title: 'Messages', elements: [
      { slug: 'message-pair', title: 'Message pair', description: 'Una burbuja del usuario y una respuesta que llega en vivo, con acciones que aparecen al pasar el cursor.', Card: MessagePairCard, Doc: MessagePairDoc },
    ],
  },
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
