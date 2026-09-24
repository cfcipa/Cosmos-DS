// Cosmos DS · Kit IA · AUI connected: Orb.
// Referente: assistant-ui «Orb» (elements/voice.tsx y voice.aui.tsx): el orbe de voz en tiempo real, un shader WebGL
// que respira según el estado (reposo, conectando, escuchando, hablando, en silencio) y el volumen, con transiciones
// suaves entre estados. Los colores salen del tema de Cosmos (default = grises, o una paleta: primary, secondary,
// success). Conectado al runtime, `AuiVoiceOrb` lee la sesión de voz y `AuiVoiceControl` conecta, silencia y cuelga.
import * as React from 'react';
import { AuiIf, useAuiState, useVoiceControls, useVoiceState, useVoiceVolume } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { decomposeColor, keyframes, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';
import { ORB_FRAG, ORB_VERT } from './orbShader';

export type VoiceOrbState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'muted';
export type VoiceOrbVariant = 'default' | 'primary' | 'secondary' | 'success';

type OrbParams = { speed: number; amplitude: number; glow: number; brightness: number; pulse: number; saturation: number };
/** Parámetros de cada estado (assistant-ui). */
const STATE_PARAMS: Record<VoiceOrbState, OrbParams> = {
  idle: { speed: 0.15, amplitude: 0.04, glow: 0.15, brightness: 0.55, pulse: 0, saturation: 0.7 },
  connecting: { speed: 0.5, amplitude: 0.1, glow: 0.45, brightness: 0.75, pulse: 1, saturation: 0.9 },
  listening: { speed: 0.4, amplitude: 0.14, glow: 0.5, brightness: 0.85, pulse: 0, saturation: 1 },
  speaking: { speed: 1.4, amplitude: 0.35, glow: 0.9, brightness: 1, pulse: 0, saturation: 1 },
  muted: { speed: 0.06, amplitude: 0.015, glow: 0.08, brightness: 0.35, pulse: 0, saturation: 0.2 },
};
/** Cuánto se acerca cada cuadro al estado nuevo, y cuánto suma el volumen (assistant-ui). */
const EASE = 0.045;
const VOLUME_GAIN = { speed: 0.4, amplitude: 0.12, glow: 0.2 };
/** Tamaño por defecto: 64px (size-16). */
const ORB_SIZE = 8;

type Rgb = [number, number, number];
const toRgb = (color: string): Rgb => {
  const { values, type } = decomposeColor(color);
  const [r, g, b] = values as number[];
  return type === 'color' ? [r, g, b] : [r / 255, g / 255, b / 255];
};

/** Tres tonos por variante: medio, claro y oscuro, del tema. */
function variantColors(t: Theme, variant: VoiceOrbVariant): [Rgb, Rgb, Rgb] {
  if (variant === 'default') return [toRgb(t.palette.grey[500]), toRgb(t.palette.grey[400]), toRgb(t.palette.grey[700])];
  const p = t.palette[variant];
  return [toRgb(p.main), toRgb(p.light), toRgb(p.dark)];
}

function initWebGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return null;
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, ORB_VERT);
  const fs = shader(gl.FRAGMENT_SHADER, ORB_FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const u = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    time: u('u_time'), speed: u('u_speed'), amplitude: u('u_amplitude'), glow: u('u_glow'), brightness: u('u_brightness'),
    pulse: u('u_pulse'), saturation: u('u_saturation'), color0: u('u_color0'), color1: u('u_color1'), color2: u('u_color2'), dpr: u('u_dpr'),
  };
  return { gl, uniforms };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface VoiceOrbProps {
  state?: VoiceOrbState;
  /** Volumen de 0 a 1. */
  volume?: number;
  variant?: VoiceOrbVariant;
  className?: string;
  sx?: SxProps<Theme>;
}

/** El orbe sin runtime: estado y volumen por props. */
export const VoiceOrb = React.memo(function VoiceOrb({ state = 'idle', volume = 0, variant = 'default', className, sx }: VoiceOrbProps) {
  const theme = useTheme();
  const colors = React.useMemo(() => variantColors(theme, variant), [theme, variant]);
  const volumeRef = React.useRef(0);
  volumeRef.current = volume;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const glRef = React.useRef<ReturnType<typeof initWebGL>>(null);
  const frame = React.useRef(0);
  const start = React.useRef(performance.now());
  const current = React.useRef<OrbParams>({ ...STATE_PARAMS.idle });
  const target = React.useRef<OrbParams>({ ...STATE_PARAMS.idle });
  React.useEffect(() => { target.current = { ...STATE_PARAMS[state] }; }, [state]);
  const reducedMotion = React.useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);

  const render = React.useCallback(() => {
    const ctx = glRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const { gl, uniforms } = ctx;
    const p = current.current;
    const tp = target.current;
    (Object.keys(p) as Array<keyof OrbParams>).forEach((k) => { p[k] = lerp(p[k], tp[k], EASE); });
    const elapsed = reducedMotion ? 0 : (performance.now() - start.current) / 1000;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const vol = volumeRef.current;
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.speed, p.speed + vol * VOLUME_GAIN.speed);
    gl.uniform1f(uniforms.amplitude, p.amplitude + vol * VOLUME_GAIN.amplitude);
    gl.uniform1f(uniforms.glow, p.glow + vol * VOLUME_GAIN.glow);
    gl.uniform1f(uniforms.brightness, p.brightness);
    gl.uniform1f(uniforms.pulse, p.pulse);
    gl.uniform1f(uniforms.saturation, p.saturation);
    gl.uniform3fv(uniforms.color0, colors[0]);
    gl.uniform3fv(uniforms.color1, colors[1]);
    gl.uniform3fv(uniforms.color2, colors[2]);
    gl.uniform1f(uniforms.dpr, dpr);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame.current = requestAnimationFrame(render);
  }, [colors, reducedMotion]);

  // Como en assistant-ui: el contexto se crea un cuadro después de montar. Así un montaje doble (StrictMode) no
  // reutiliza un contexto ya perdido por el desmontaje anterior.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => { cancelAnimationFrame(id); setReady(false); };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!ready || !canvas) return undefined;
    glRef.current = initWebGL(canvas);
    if (!glRef.current) return undefined;
    frame.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame.current);
      glRef.current?.gl.getExtension('WEBGL_lose_context')?.loseContext();
      glRef.current = null;
    };
  }, [ready, render]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      aria-hidden="true"
      data-slot="aui-voice-orb"
      data-state={state}
      className={className}
      sx={[(t) => ({ display: 'block', width: t.spacing(ORB_SIZE), height: t.spacing(ORB_SIZE), flexShrink: 0 }), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
});

type VoiceState = ReturnType<typeof useVoiceState>;
export function deriveVoiceOrbState(voice: VoiceState): VoiceOrbState {
  if (!voice) return 'idle';
  if (voice.status.type === 'starting') return 'connecting';
  if (voice.status.type === 'ended') return 'idle';
  if (voice.isMuted) return 'muted';
  if (voice.mode === 'speaking') return 'speaking';
  return 'listening';
}

/** El orbe conectado: lee el estado y el volumen de la sesión de voz del runtime. */
export function AuiVoiceOrb({ state, ...rest }: VoiceOrbProps) {
  const voice = useVoiceState();
  const volume = useVoiceVolume();
  return <VoiceOrb state={state ?? deriveVoiceOrbState(voice)} volume={volume} {...rest} />;
}

const STATE_LABEL: Record<VoiceOrbState, string> = {
  idle: 'Sin conexión',
  connecting: 'Conectando…',
  listening: 'Escuchando',
  speaking: 'Hablando',
  muted: 'Micrófono en silencio',
};
const DOT = 1.25;
/** Controles de la llamada del tablero: botones de 34px con íconos de 20px; conectar con ícono de 16px. */
const CALL_BUTTON = 4.25;
const CALL_ICON = 20;
const CONNECT_ICON = 16;
const dotPulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: .4; }`;

export function AuiVoiceStatusDot() {
  const state = deriveVoiceOrbState(useVoiceState());
  const color = { idle: 'text.secondary', connecting: 'warning.main', listening: 'success.main', speaking: 'success.main', muted: 'error.main' }[state];
  return (
    <Box
      component="span"
      aria-hidden="true"
      data-state={state}
      sx={(t) => ({
        width: t.spacing(DOT), height: t.spacing(DOT), flexShrink: 0, borderRadius: '50%', bgcolor: color,
        transition: t.transitions.create('background-color', { duration: t.transitions.duration.standard }),
        animation: state === 'connecting' ? `${dotPulse} 1s ease-in-out infinite` : 'none',
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    />
  );
}

/** La barra de la llamada: punto de estado y conectar, o «Conectando…», o silenciar y colgar. */
export function AuiVoiceControl({ sx }: { sx?: SxProps<Theme> }) {
  const state = deriveVoiceOrbState(useVoiceState());
  return (
    <Stack direction="row" alignItems="center" spacing={1} data-slot="aui-voice-control" sx={sx}>
      <AuiVoiceStatusDot />
      <Typography role="status" variant="body1" sx={{ whiteSpace: 'nowrap', mr: 0.5 }}>{STATE_LABEL[state]}</Typography>
      <AuiIf condition={(s) => s.thread.voice == null || s.thread.voice.status.type === 'ended'}><ConnectButton /></AuiIf>
      <AuiIf condition={(s) => s.thread.voice?.status.type === 'running'}>
        <MuteButton />
        <DisconnectButton />
      </AuiIf>
    </Stack>
  );
}

function ConnectButton() {
  const { connect } = useVoiceControls();
  const runOwnsThread = useAuiState((s) => s.thread.isRunning || s.thread.messages[s.thread.messages.length - 1]?.status?.type === 'requires-action');
  return <Button variant="contained" startIcon={<Phone size={CONNECT_ICON} />} disabled={runOwnsThread} onClick={() => connect()}>Conectar</Button>;
}

function MuteButton() {
  const voice = useVoiceState();
  const { mute, unmute } = useVoiceControls();
  const muted = voice?.isMuted ?? false;
  return (
    <AuiIconButton tooltip={muted ? 'Activar micrófono' : 'Silenciar'} aria-pressed={muted} size={CALL_BUTTON} onClick={() => (muted ? unmute() : mute())} sx={{ '& svg': { width: CALL_ICON, height: CALL_ICON } }}>
      {muted ? <MicOff /> : <Mic />}
    </AuiIconButton>
  );
}

function DisconnectButton() {
  const { disconnect } = useVoiceControls();
  return (
    <AuiIconButton tooltip="Desconectar" size={CALL_BUTTON} onClick={() => disconnect()} sx={{ color: 'error.main', '& svg': { width: CALL_ICON, height: CALL_ICON } }}>
      <PhoneOff />
    </AuiIconButton>
  );
}
