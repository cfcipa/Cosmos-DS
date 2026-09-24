import CosmosTheme from '../../ThemeCOSMOS.json';

/**
 * Figma token values are either a literal (hex, rgba string, number, string)
 * or an alias reference like "{primary.light.500}" pointing at another
 * variable's own dot-path (collection-relative, no collection prefix).
 * This resolver walks the alias graph so semantic tokens (palette.primary.main,
 * palette.error.main, etc.) always follow whatever they currently alias to in
 * Figma, instead of hardcoding which raw family/shade a semantic slot maps to.
 */

export type ThemeMode = 'Light' | 'Dark';

type TokenLeaf = { $value: unknown; $type: string };

const ALIAS_PATTERN = /^\{([\w.]+)\}$/;

// Order matters: collections are indexed first-write-wins so that when the
// same dot-path exists in more than one collection (e.g. brand-colors.secondary.500
// and palette.secondary.500 both resolve to "secondary.500"), the primitive
// collection (brand-colors) wins over the semantic one (palette) that merely
// aliases it — resolving into palette's own copy would just point back at itself.
const COLLECTIONS_TO_INDEX = ['brand-colors', 'palette', 'typography', 'spacing', 'shape', 'breakpoints'] as const;

function isTokenLeaf(node: unknown): node is TokenLeaf {
  return typeof node === 'object' && node !== null && '$value' in (node as Record<string, unknown>);
}

function indexTree(tree: unknown, prefix: string, registry: Map<string, TokenLeaf>): void {
  if (isTokenLeaf(tree)) {
    if (!registry.has(prefix)) registry.set(prefix, tree);
    return;
  }
  if (typeof tree === 'object' && tree !== null) {
    for (const key of Object.keys(tree)) {
      indexTree((tree as Record<string, unknown>)[key], prefix ? `${prefix}.${key}` : key, registry);
    }
  }
}

function buildRegistry(): Map<string, TokenLeaf> {
  const registry = new Map<string, TokenLeaf>();
  for (const key of COLLECTIONS_TO_INDEX) {
    indexTree((CosmosTheme as Record<string, unknown>)[key], '', registry);
  }
  return registry;
}

const registry = buildRegistry();

function valueForMode(value: unknown, mode: ThemeMode): unknown {
  if (typeof value === 'object' && value !== null && ('Light' in value || 'Dark' in value)) {
    const modeValue = value as Partial<Record<ThemeMode, unknown>>;
    return mode in modeValue ? modeValue[mode] : modeValue.Light;
  }
  return value;
}

function resolvePath(path: string, mode: ThemeMode, depth: number): unknown {
  if (depth > 10) {
    throw new Error(`Token alias resolution exceeded max depth for "{${path}}" — check for a circular reference in ThemeCOSMOS.json`);
  }
  const leaf = registry.get(path);
  if (!leaf) {
    throw new Error(`Unresolved token reference "{${path}}" — no matching variable found in ThemeCOSMOS.json`);
  }
  return resolveValue(valueForMode(leaf.$value, mode), mode, depth + 1);
}

function resolveValue(value: unknown, mode: ThemeMode, depth: number): unknown {
  if (typeof value === 'string') {
    const match = value.match(ALIAS_PATTERN);
    if (match) return resolvePath(match[1], mode, depth);
  }
  return value;
}

/**
 * Resolve a raw `$value` (already picked for a mode, or still mode-keyed) into
 * its final literal value, following alias chains like "{primary.light.500}".
 *
 * @param value  A `$value.Light` / `$value.Dark` string/number, or the whole
 *               mode-keyed `$value` object (e.g. `CosmosTheme.palette.primary.main.$value`).
 * @param mode   Which mode to pick when the value (or an alias target) is mode-keyed.
 */
export function resolveToken(value: unknown, mode: ThemeMode): unknown {
  return resolveValue(valueForMode(value, mode), mode, 0);
}

/** Convenience: resolve a token straight to a CSS color/number string. */
export function resolveTokenAsString(value: unknown, mode: ThemeMode): string {
  return String(resolveToken(value, mode));
}
