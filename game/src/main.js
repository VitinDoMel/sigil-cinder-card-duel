// Main entrypoint: initializes canvas, DPR scaling, game loop, shot staging, and accessibility live status.

import { Animator } from './animator.js';
import { SoundEngine } from './audio.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { GameEngine, SCREEN_TITLE } from './engine.js';
import { InputController } from './input.js';
import { TableRenderer } from './renderer.js';
import { stageShotScene } from './shots.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotParam = params.get('shot');
const seedParam = Number(params.get('seed')) || 7;

const engine = new GameEngine(seedParam);
const animator = new Animator();
const sound = new SoundEngine();
const uiState = {
  hoveredHandUid: null,
  hoveredSlot: -1,
  hoveredButton: null,
  showRules: false,
  buttons: [],
  handRects: [],
  slotRects: [],
};

const renderer = new TableRenderer(ctx, engine, animator, uiState);
const input = new InputController(canvas, engine, animator, sound, uiState);

function resizeCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = CANVAS_HEIGHT * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

if (shotParam) {
  stageShotScene(shotParam, engine, animator);
  // Snap card targets immediately and advance only a few frames so bursts/particles stay vivid
  renderer.syncCardTargets(true);
  for (let i = 0; i < 10; i += 1) {
    animator.step(1 / 60);
  }
  renderer.render(input.pointer);
  window.__SHOT_READY__ = true;
} else {
  engine.resetMatch(0, seedParam, SCREEN_TITLE);
}

let lastTime = performance.now();
let lastAnnounced = '';

function frame(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
  lastTime = now;

  if (!shotParam) {
    renderer.syncCardTargets(false);
    animator.step(dt);
    renderer.render(input.pointer);
  }

  const s = engine.state;
  const summary = `${engine.screen} Turn ${s.turn} HP ${s.player.hp}/${s.player.maxHp} Rival ${s.opponent.hp}/${s.opponent.maxHp} Score ${s.score}`;
  if (summary !== lastAnnounced && statusEl) {
    statusEl.textContent = summary;
    lastAnnounced = summary;
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
