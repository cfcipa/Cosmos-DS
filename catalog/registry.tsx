import * as React from 'react';
import { LoaderPlayground, LoaderCard } from './elements/Loader';

export interface ElementEntry {
  slug: string;
  title: string;
  description: string;
  /** Vista previa en la tarjeta de Elements. */
  Card: React.ComponentType;
  /** Playground de la página del elemento (demo, Properties, código). */
  Playground: React.ComponentType;
  /** Cómo se importa. */
  usage: string;
  /** Props para la tabla API. */
  api: Array<{ name: string; type: string; default?: string; description: string }>;
}
export interface Section { id: string; title: string; elements: ElementEntry[] }

/** Secciones en el orden del catálogo Elements de assistant-ui. Prueba: solo Loader. */
export const SECTIONS: Section[] = [
  {
    id: 'reasoning', title: 'Reasoning', elements: [
      {
        slug: 'loader', title: 'Loader',
        description: 'El símbolo de Sinco marca el tiempo mientras el modelo todavía no tiene nada que mostrar.',
        Card: LoaderCard, Playground: LoaderPlayground,
        usage: "import { Loader } from '@sinco/cosmos-ds';\n\n<Loader animation=\"wave\" label=\"Pensando\" />",
        api: [
          { name: 'animation', type: "'wave' | 'pulse'", default: "'wave'", description: 'wave alterna las dos mitades del símbolo; pulse respira todo el símbolo.' },
          { name: 'label', type: 'string', default: "'Pensando'", description: 'Texto bajo el símbolo, con brillo. También es la etiqueta accesible.' },
          { name: 'tick', type: 'number', description: 'Tick controlado (cada tick = 120 ms). Sin él, el loader avanza solo.' },
          { name: 'size', type: 'number', default: '44', description: 'Tamaño del símbolo en px.' },
          { name: 'className', type: 'string', description: 'Clase del contenedor.' },
        ],
      },
    ],
  },
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
