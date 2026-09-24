import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ComposerCommand {
  name: string;
  description: string;
  /** Ícono de lucide-react, el set del kit. */
  icon: LucideIcon;
}

export interface ComposerPerson {
  name: string;
  role: 'agent' | 'human';
}

/** Como en assistant-ui: los comandos cuyo nombre empieza por lo escrito tras la barra (sin espacios), o ninguno. */
export function useSlashMatches(value: string, commands: readonly ComposerCommand[] | undefined): ComposerCommand[] {
  return React.useMemo(() => {
    if (!commands || !value.startsWith('/') || value.includes(' ')) return [];
    const query = value.slice(1).toLowerCase();
    return commands.filter((command) => command.name.startsWith(query));
  }, [commands, value]);
}

const MENTION = /@([A-Za-zÀ-ÿ0-9_]*)$/;

/** Las personas que coinciden con la mención al final del texto, o ninguna si no se está escribiendo una. */
export function useMentionMatches(value: string, people: readonly ComposerPerson[] | undefined): ComposerPerson[] {
  return React.useMemo(() => {
    if (!people) return [];
    const match = MENTION.exec(value);
    if (!match) return [];
    const query = match[1].toLowerCase();
    return people.filter((person) => person.name.toLowerCase().startsWith(query));
  }, [people, value]);
}

/** Reemplaza la mención al final del texto por el nombre elegido. */
export function applyMention(value: string, name: string): string {
  return value.replace(MENTION, `@${name} `);
}

/**
 * Navegación de teclado de un menú del composer (combobox con aria-activedescendant): ↑ ↓ mueven, Enter (y Tab si se pide)
 * elige, Esc cierra. Devuelve true si consumió la tecla.
 */
export function handleMenuKey(
  event: React.KeyboardEvent,
  { count, active, onActiveChange, onPick, onClose, tabPicks = false }: { count: number; active: number; onActiveChange: (i: number) => void; onPick: (i: number) => void; onClose: () => void; tabPicks?: boolean },
): boolean {
  if (count === 0) return false;
  if (event.key === 'ArrowDown') { event.preventDefault(); onActiveChange((active + 1) % count); return true; }
  if (event.key === 'ArrowUp') { event.preventDefault(); onActiveChange((active - 1 + count) % count); return true; }
  if (event.key === 'Enter' || (tabPicks && event.key === 'Tab')) { event.preventDefault(); onPick(active); return true; }
  if (event.key === 'Escape') { event.preventDefault(); onClose(); return true; }
  return false;
}
