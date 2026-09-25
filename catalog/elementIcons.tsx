import type { ComponentType } from 'react';
import {
  AlertTriangle, AppWindow, ArrowDownToLine, AtSign, AudioLines, Boxes, BookOpen, Brain, ChevronsUpDown, CircleDot,
  Clock, Command, Compass, Cpu, Eye, File, FileBarChart, FileText, FolderSearch, Gauge, GitBranch, Globe, Hash,
  History, Image, ImagePlus, Inbox, Layers, Lightbulb, Link2, List, ListOrdered, ListTree, Loader2, Map, MessageCircle,
  MessageSquare, MessageSquarePlus, MessagesSquare, Mic, MoreHorizontal, MoreVertical, MousePointerClick, Network,
  PanelLeft, PanelRight, Paperclip, PauseCircle, Pencil, Percent, PenTool, PieChart, Pill, Plug, Quote, RefreshCw,
  Rocket, Search, Settings, Share2, ShieldAlert, ShieldCheck, Slash, SlidersHorizontal, Smartphone, Sparkles,
  SquarePen, StickyNote, ThumbsUp, Timer, Type, UserCircle, Volume2, Wand2, Wifi, Wrench,
} from 'lucide-react';

type ElementIcon = ComponentType<{ size?: number | string }>;

/** Un ícono lucide-react por elemento, alusivo a lo que hace (no el componente en vivo): la vista previa de la
 * grilla de Elements. */
export const ELEMENT_ICONS: Record<string, ElementIcon> = {
  loader: Loader2,
  'thinking-indicator': Brain,
  'streaming-text': Type,
  'typing-indicator': MoreHorizontal,
  'reasoning-effort': Gauge,
  'guardrail-notice': ShieldAlert,

  'message-pair': MessageSquare,
  'message-branches': GitBranch,
  'message-actions': MoreVertical,
  'error-state': AlertTriangle,
  'message-queue': ListOrdered,
  'edit-message': Pencil,
  'feedback-dialog': ThumbsUp,
  'stopped-run': PauseCircle,
  timestamps: Clock,
  'speaker-identity': UserCircle,
  'regenerate-with': RefreshCw,
  confidence: Percent,

  'web-search': Globe,
  'inline-citation': Quote,
  'image-generation': ImagePlus,
  'retrieval-chunks': Layers,
  'document-reference': FileText,
  memory: StickyNote,
  'research-report': FileBarChart,
  map: Map,

  composer: SquarePen,
  'slash-commands': Slash,
  mentions: AtSign,
  attachments: Paperclip,
  models: Cpu,
  dictation: Mic,
  context: Layers,
  'draft-restore': History,
  'context-breakdown': PieChart,
  'prompt-library': BookOpen,
  'command-palette': Command,

  'voice-conversation': AudioLines,
  'read-aloud': Volume2,

  'chat-panel': MessagesSquare,
  'empty-state': Inbox,
  'scroll-anchor': ArrowDownToLine,
  canvas: PenTool,
  'connection-state': Wifi,
  'shared-conversation': Share2,
  'conversation-search': Search,
  'thread-search': FolderSearch,
  launcher: Rocket,
  'settings-panel': Settings,
  onboarding: Compass,
  'mobile-composer': Smartphone,

  'aui-thread': MessageCircle,
  'aui-assistant-modal': AppWindow,
  'aui-assistant-sidebar': PanelLeft,
  'aui-thread-list': List,
  'aui-thread-list-sidebar': ListTree,
  'aui-orb': CircleDot,
  'aui-reasoning': Brain,
  'aui-message-timing': Timer,
  'aui-conversation-map': Network,
  'aui-context-display': Layers,
  'aui-mcp-config': Plug,
  'aui-attachment': Paperclip,
  'aui-followups': MessageSquarePlus,
  'aui-tool-fallback': Wrench,
  'aui-tool-group': Boxes,
  'aui-quote': Quote,
  'aui-sources': Link2,
  'aui-image': Image,
  'aui-file': File,
  'aui-model-selector': ChevronsUpDown,
  'aui-trigger-popover': AtSign,
  'aui-directive-text': Hash,
  'aui-composer-pill': Pill,
  'aui-starter-suggestions': Lightbulb,
  'aui-selection-context': MousePointerClick,
  'aui-ask-ai-action': Sparkles,
  'aui-inline-prompt': Wand2,
  'aui-assistant-panel': PanelRight,
  'aui-response-preview': Eye,
  'tool-approval': ShieldCheck,
};

const FALLBACK_ICON: ElementIcon = SlidersHorizontal;

export function elementIcon(slug: string): ElementIcon {
  return ELEMENT_ICONS[slug] ?? FALLBACK_ICON;
}
