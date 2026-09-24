// Cosmos DS · Kit IA · Reasoning: Loader.
// Tablero aprobado «Loader» (lienzo Asistente Cosmos): el símbolo de Sinco marca el tiempo mientras
// el modelo todavía no tiene nada que mostrar. Colores y tipografía salen del tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

export type LoaderAnimation = 'wave' | 'pulse';

export interface LoaderProps {
  /** 'wave' alterna las dos mitades del símbolo; 'pulse' respira todo el símbolo. Default 'wave'. */
  animation?: LoaderAnimation;
  /** Texto bajo el símbolo, con brillo. También es la etiqueta accesible. Default 'Pensando'. */
  label?: string;
  /** Tick controlado (cada tick = 120 ms). Sin él, el loader avanza solo. */
  tick?: number;
  /** Tamaño del símbolo en px. Default 44. */
  size?: number;
  className?: string;
}

const TOP = 'M209.382 58.0308C212.481 63.5926 209.709 70.4043 203.852 72.8996L16.48 152.724C12.7051 154.332 8.32071 152.602 6.97277 148.727C5.74599 145.199 7.58445 141.387 11.0201 139.924L130.784 88.9062C136.031 86.6635 139.199 81.5813 139.239 76.2116C139.252 74.3615 138.891 72.4807 138.125 70.6665C135.117 63.5909 126.947 60.3029 119.872 63.3112L3.35047 112.955C2.14202 113.47 0.797648 112.602 0.807368 111.288C1.26214 49.8294 51.4601 0.368717 112.919 0.82349C119.504 0.872218 125.953 1.4914 132.216 2.63581C137.437 3.58967 137.833 10.2997 132.951 12.38L113.265 20.7687L79.5551 35.1336C74.3077 37.3763 71.1399 42.4585 71.1001 47.8421C71.0864 49.6922 71.4481 51.573 72.2138 53.3872C75.2221 60.4488 83.3918 63.7368 90.4673 60.7286L172.744 25.6634C176.531 24.0498 180.921 24.5443 184.058 27.2085C194.237 35.8533 202.841 46.2895 209.382 58.0308Z';
const BOTTOM = 'M140.125 167.426C140.111 169.276 140.473 171.157 141.238 172.971C144.247 180.032 152.416 183.334 159.492 180.312L198.663 163.626C203.541 161.548 208.109 166.475 205.199 170.907C185.162 201.421 150.519 221.466 111.291 221.176C80.9664 220.952 53.5571 208.611 33.6284 188.789C28.2918 183.48 30.5649 174.763 37.4897 171.813L208.47 98.9625C215.399 96.0104 223.261 100.415 223.389 107.945C223.405 108.865 223.41 109.787 223.403 110.711C223.388 112.666 223.323 114.608 223.208 116.537C222.964 120.651 220.278 124.166 216.487 125.781L148.58 154.717C143.332 156.96 140.164 162.056 140.125 167.426Z';
const TICK_MS = 120;
const EASE = '360ms ease-in-out';
const shimmer = keyframes`from { background-position: 100% 0; } to { background-position: -100% 0; }`;

/** Opacidades y escala del símbolo para un tick (misma fórmula que el tablero). */
export function loaderFrame(animation: LoaderAnimation, tick: number) {
  const half = Math.floor(tick / 4) % 2 === 0;
  const breath = 0.5 + 0.5 * Math.cos((tick / 4) * Math.PI);
  const b = 0.35 + 0.65 * breath;
  return animation === 'wave'
    ? { top: half ? 1 : 0.2, bottom: half ? 0.2 : 1, scale: 1 }
    : { top: b, bottom: b, scale: 0.92 + 0.08 * breath };
}

export function Loader({ animation = 'wave', label = 'Pensando', tick, size = 44, className }: LoaderProps) {
  const [own, setOwn] = React.useState(0);
  const controlled = tick !== undefined;
  React.useEffect(() => {
    if (controlled) return undefined;
    const id = window.setInterval(() => setOwn((n) => n + 1), TICK_MS);
    return () => clearInterval(id);
  }, [controlled]);
  const f = loaderFrame(animation, controlled ? (tick as number) : own);
  return (
    <Box role="status" aria-live="polite" aria-label={label} className={className}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box component="svg" aria-hidden="true" width={size} height={size} viewBox="0 0 225 222" fill="none"
        sx={{ transform: `scale(${f.scale})`, transition: `transform ${EASE}`, color: 'primary.main',
          '& path': { transition: `opacity ${EASE}` }, '@media (prefers-reduced-motion: reduce)': { transform: 'none', '& path': { opacity: '1 !important', transition: 'none' } } }}>
        <path d={TOP} fill="currentColor" style={{ opacity: f.top }} />
        <path d={BOTTOM} fill="currentColor" style={{ opacity: f.bottom }} />
      </Box>
      {label ? (
        <Box component="span" sx={(t) => ({
          fontSize: 13, lineHeight: '18px', fontWeight: 500, fontFamily: t.typography.fontFamily,
          color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundSize: '200% 100%',
          backgroundImage: `linear-gradient(90deg, ${t.palette.text.secondary} 0%, ${t.palette.text.secondary} 35%, ${t.palette.text.disabled} 50%, ${t.palette.text.secondary} 65%, ${t.palette.text.secondary} 100%)`,
          animation: `${shimmer} 2s linear infinite`,
          '@media (prefers-reduced-motion: reduce)': { color: t.palette.text.secondary, backgroundImage: 'none', animation: 'none' },
        })}>{label}</Box>
      ) : null}
    </Box>
  );
}
