// Game configuration, suit visual tokens, layout constants, and palette for Sigil & Cinder.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const MAX_HAND_SIZE = 7;
export const DRAW_PER_TURN = 5;
export const MAX_SLOTS = 3;
export const BASE_AETHER = 3;
export const MAX_AETHER = 6;
export const MAX_CYCLES_PER_TURN = 1;

export const CARD_W = 112;
export const CARD_H = 158;
export const OPP_CARD_W = 84;
export const OPP_CARD_H = 116;

export const SUITS = {
  ember: {
    id: 'ember',
    label: 'EMBER',
    color: '#ef4444',
    bright: '#fca5a5',
    dark: '#3b1116',
    border: '#f87171',
    shape: 'flame',
    role: 'Burst & Burn',
  },
  tide: {
    id: 'tide',
    label: 'TIDE',
    color: '#38bdf8',
    bright: '#bae6fd',
    dark: '#0e2538',
    border: '#7dd3fc',
    shape: 'drop',
    role: 'Ward, Chill & Draw',
  },
  briar: {
    id: 'briar',
    label: 'BRIAR',
    color: '#22c55e',
    bright: '#bbf7d0',
    dark: '#102b1b',
    border: '#4ade80',
    shape: 'leaf',
    role: 'Aether, Heal & Venom',
  },
  brass: {
    id: 'brass',
    label: 'BRASS',
    color: '#f59e0b',
    bright: '#fde68a',
    dark: '#2e2109',
    border: '#fbbf24',
    shape: 'gear',
    role: 'Echo & Parry',
  },
};

export const SUIT_ORDER = ['ember', 'tide', 'briar', 'brass'];

export const PALETTE = {
  bgDeep: '#091117',
  feltCenter: '#13282b',
  feltEdge: '#0b181d',
  gold: '#e0b354',
  goldDim: '#8e6d2f',
  goldBright: '#fce197',
  ivory: '#f4efe6',
  slateText: '#9fb3c0',
  danger: '#fb7185',
  shield: '#60a5fa',
  venom: '#4ade80',
  burn: '#fb923c',
  cardBack: '#141d26',
  slotBg: 'rgba(13, 25, 32, 0.72)',
};

export const TIMINGS = {
  dealStagger: 0.08,
  resolveStep: 0.42,
  enemyReveal: 0.35,
};
