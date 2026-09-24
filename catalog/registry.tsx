import * as React from 'react';
import { LoaderDoc, LoaderCard } from './elements/Loader';
import { ThinkingIndicatorDoc, ThinkingIndicatorCard } from './elements/ThinkingIndicator';
import { StreamingTextDoc, StreamingTextCard } from './elements/StreamingText';
import { TypingIndicatorDoc, TypingIndicatorCard } from './elements/TypingIndicator';
import { ReasoningEffortDoc, ReasoningEffortCard } from './elements/ReasoningEffort';

export interface ElementEntry {
  slug: string;
  title: string;
  description: string;
  /** Vista previa en la tarjeta de Elements. */
  Card: React.ComponentType;
  /** Qué muestra y en qué estado del asistente aparece y se va (como en assistant-ui: hechos, no consejos). */
  behavior: string;
  /** Diferencia con los elementos con los que se puede confundir. */
  differences?: ElementDifference[];
  /** Página del elemento: demo y propiedades. */
  Doc: React.ComponentType;
}
export interface ElementDifference {
  slug: string;
  text: string;
  /** Marca una decisión de diseño todavía abierta. */
  pending?: boolean;
}
export interface Section { id: string; title: string; elements: ElementEntry[] }

/** Secciones en el orden del catálogo Elements de assistant-ui.  */
export const SECTIONS: Section[] = [
  {
    id: 'reasoning', title: 'Reasoning', elements: [
      {
        slug: 'loader',
        title: 'Loader',
        description: 'El símbolo de Sinco marca el tiempo mientras el modelo todavía no tiene nada que mostrar.',
        behavior: 'El símbolo alterna sus dos mitades mientras la etiqueta nombra lo que pasa. Aparece en una sola ventana: hay una ejecución activa y el mensaje más nuevo todavía no tiene contenido. Con la primera parte de la respuesta, se va.',
        differences: [
          { slug: 'typing-indicator', text: 'Cubre la misma ventana, antes del primer texto. Falta definir cuál de los dos usa Cosmos por defecto.', pending: true },
          { slug: 'thinking-indicator', text: 'Dice qué está haciendo el asistente y cuánto lleva. El Loader solo marca que hay espera.' },
        ],
        Card: LoaderCard,
        Doc: LoaderDoc,
      },
      {
        slug: 'thinking-indicator',
        title: 'Thinking indicator',
        description: 'Una línea viva que nombra lo que el asistente hace ahora mismo, con el tiempo transcurrido.',
        behavior: 'Un punto vivo, una etiqueta que entra con un fundido cada vez que cambia y el tiempo transcurrido. La etiqueta nombra la herramienta que está corriendo; si no hay ninguna, dice «Thinking». Se queda durante toda la ejecución, incluidas las llamadas a herramientas, y se va cuando empieza a llegar el texto.',
        differences: [
          { slug: 'typing-indicator', text: 'Solo comunica presencia y dura hasta el primer texto. No dice qué pasa ni cuánto tarda.' },
          { slug: 'streaming-text', text: 'Toma el relevo: cuando llega el texto, el Thinking indicator se va.' },
        ],
        Card: ThinkingIndicatorCard,
        Doc: ThinkingIndicatorDoc,
      },
      {
        slug: 'streaming-text',
        title: 'Streaming text',
        description: 'Las palabras llegan suave: las más nuevas entran en azul y se asientan en tinta.',
        behavior: 'El texto llega palabra a palabra: las dos más nuevas entran en azul y en 700 ms se asientan en el color del texto. Mientras llega, un cursor marca el final; al terminar, el cursor desaparece. Los códigos e identificadores (CE-4471) van en monoespaciada.',
        differences: [
          { slug: 'thinking-indicator', text: 'Va antes. Se va cuando empieza el Streaming text.' },
          { slug: 'typing-indicator', text: 'Va antes. Se va con la primera palabra.' },
        ],
        Card: StreamingTextCard,
        Doc: StreamingTextDoc,
      },
      {
        slug: 'typing-indicator',
        title: 'Typing indicator',
        description: 'Tres puntos que se leen como presencia, no como ruido, justo donde aparecerá la respuesta.',
        behavior: 'Tres puntos que rebotan en ola, solos o sobre una burbuja. Aparecen en una sola ventana: hay una ejecución activa y el mensaje más nuevo todavía no ha producido contenido. Con el primer texto, se van.',
        differences: [
          { slug: 'thinking-indicator', text: 'Dice qué hace el asistente y cuánto lleva, y dura toda la ejecución. El Typing indicator solo dice «estoy aquí».' },
          { slug: 'loader', text: 'Cubre la misma ventana, antes del primer texto. Falta definir cuál de los dos usa Cosmos por defecto.', pending: true },
        ],
        Card: TypingIndicatorCard,
        Doc: TypingIndicatorDoc,
      },
      {
        slug: 'reasoning-effort',
        title: 'Reasoning effort',
        description: 'Cuánto pensar, y cuánto de ese presupuesto gastó de verdad la ejecución.',
        behavior: 'Dos cosas separadas en un mismo control. El nivel se elige antes y se envía al modelo con la solicitud; el consumo llega de la ejecución y llena la barra. La barra se detiene en 100 % aunque el gasto pase del presupuesto; el contador muestra el número real.',
        Card: ReasoningEffortCard,
        Doc: ReasoningEffortDoc,
      },
    ],
  },
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
