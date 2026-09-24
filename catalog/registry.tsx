import * as React from 'react';
import { LoaderDoc, LoaderCard } from './elements/Loader';

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

/** Secciones en el orden del catálogo Elements de assistant-ui. Prueba: solo Loader. */
export const SECTIONS: Section[] = [
  {
    id: 'reasoning', title: 'Reasoning', elements: [
      { slug: 'loader', title: 'Loader', description: 'El símbolo de Sinco marca el tiempo mientras el modelo todavía no tiene nada que mostrar.', Card: LoaderCard, Doc: LoaderDoc },
    ],
  },
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
