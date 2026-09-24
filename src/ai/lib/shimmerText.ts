import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/** Media query guard for every animation in the kit: respects the OS "reduce motion" setting. */
export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

/** The assistant-ui reference curve for collapse/expand and other interactive motion (ToolCall, Web search, Map). */
export const COLLAPSE_EASE = 'cubic-bezier(.32, .72, 0, 1)';

/** Background-position sweep that drives the shimmer text (Loader, Thinking indicator, ToolCall's running label). */
export const shimmer = keyframes`
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
`;

/**
 * sx for a line of text with a moving highlight: solid `text.secondary`, dipping to `ai.iconDisabled`
 * at the midpoint, plain `text.secondary` (no gradient, no animation) under reduced motion.
 * Pass a custom `animation` to combine the shimmer with another keyframe (e.g. a fade-in on mount).
 */
export function shimmerTextSx(t: Theme, animation: string = `${shimmer} 2s linear infinite`) {
  return {
    color: 'transparent',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    backgroundSize: '200% 100%',
    backgroundImage: `linear-gradient(90deg, ${t.palette.text.secondary} 0%, ${t.palette.text.secondary} 35%, ${t.palette.ai.iconDisabled} 50%, ${t.palette.text.secondary} 65%, ${t.palette.text.secondary} 100%)`,
    animation,
    [REDUCED_MOTION]: { color: t.palette.text.secondary, backgroundImage: 'none', animation: 'none' },
  } as const;
}
