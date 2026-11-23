// Mouse drag-and-drop, click-to-play, hover hitboxes, and full keyboard controls.

import { CARD_H, CARD_W, MAX_SLOTS } from './config.js';
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './engine.js';
import { RIVALS } from './opponent.js';

export class InputController {
  constructor(canvas, engine, animator, sound, uiState) {
    this.canvas = canvas;
    this.engine = engine;
    this.animator = animator;
    this.sound = sound;
    this.ui = uiState;

    this.pointer = { x: 0, y: 0, down: false, draggingUid: null, dragOffsetX: 0, dragOffsetY: 0 };
    this.bindEvents();
  }

  toCanvasCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = 1280 / Math.max(1, rect.width);
    const scaleY = 720 / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  hitRect(pt, rect) {
    return rect && pt.x >= rect.x && pt.x <= rect.x + rect.w && pt.y >= rect.y && pt.y <= rect.y + rect.h;
  }

  bindEvents() {
    this.canvas.addEventListener('pointermove', (ev) => {
      const pt = this.toCanvasCoords(ev.clientX, ev.clientY);
      this.pointer.x = pt.x;
      this.pointer.y = pt.y;
      this.updateHover(pt);
    });

    this.canvas.addEventListener('pointerdown', (ev) => {
      this.sound.unlock();
      const pt = this.toCanvasCoords(ev.clientX, ev.clientY);
      this.pointer.x = pt.x;
      this.pointer.y = pt.y;
      this.pointer.down = true;
      this.handlePointerDown(pt, ev.button);
    });

    this.canvas.addEventListener('pointerup', (ev) => {
      const pt = this.toCanvasCoords(ev.clientX, ev.clientY);
      this.pointer.x = pt.x;
      this.pointer.y = pt.y;
      this.pointer.down = false;
      this.handlePointerUp(pt);
    });

    this.canvas.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
      const pt = this.toCanvasCoords(ev.clientX, ev.clientY);
      if (this.engine.screen === SCREEN_PLAY) {
        const cardUid = this.findHandCardAt(pt);
        if (cardUid !== null && this.engine.cycleCard(cardUid)) {
          this.sound.playCycle();
        }
      }
    });

    window.addEventListener('keydown', (ev) => {
      this.sound.unlock();
      this.handleKeyDown(ev);
    });
  }

  updateHover(pt) {
    this.ui.hoveredHandUid = this.findHandCardAt(pt);
    this.ui.hoveredSlot = this.findSlotAt(pt);
    this.ui.hoveredButton = null;
    for (const btn of this.ui.buttons) {
      if (this.hitRect(pt, btn)) {
        this.ui.hoveredButton = btn.id;
        break;
      }
    }
  }

  findHandCardAt(pt) {
    if (this.engine.screen !== SCREEN_PLAY) return null;
    const rects = this.ui.handRects;
    for (let i = rects.length - 1; i >= 0; i -= 1) {
      const item = rects[i];
      if (
        pt.x >= item.cx - CARD_W * 0.52 &&
        pt.x <= item.cx + CARD_W * 0.52 &&
        pt.y >= item.cy - CARD_H * 0.55 &&
        pt.y <= item.cy + CARD_H * 0.55
      ) {
        return item.uid;
      }
    }
    return null;
  }

  findSlotAt(pt) {
    for (let i = 0; i < MAX_SLOTS; i += 1) {
      const rect = this.ui.slotRects[i];
      if (this.hitRect(pt, rect)) return i;
    }
    return -1;
  }

  handlePointerDown(pt, button) {
    if (button === 2) return;

    for (const btn of this.ui.buttons) {
      if (this.hitRect(pt, btn)) {
        this.triggerButton(btn.id);
        return;
      }
    }

    if (this.ui.showRules) {
      this.ui.showRules = false;
      return;
    }

    if (this.engine.screen !== SCREEN_PLAY) return;

    // Clicking an occupied board slot removes the card back to hand
    const slotIdx = this.findSlotAt(pt);
    if (slotIdx !== -1) {
      if (this.engine.state.selectedCardUid !== null) {
        if (this.engine.playCardToSlot(this.engine.state.selectedCardUid, slotIdx)) {
          this.sound.playSnap();
          return;
        }
      } else if (this.engine.state.slots[slotIdx]) {
        if (this.engine.unslotCard(slotIdx)) {
          this.sound.playCycle();
          return;
        }
      }
    }

    // Check hand card for drag or select
    const handUid = this.findHandCardAt(pt);
    if (handUid !== null) {
      const rect = this.ui.handRects.find((r) => r.uid === handUid);
      this.pointer.draggingUid = handUid;
      this.pointer.dragStartX = pt.x;
      this.pointer.dragStartY = pt.y;
      if (rect) {
        this.pointer.dragOffsetX = pt.x - rect.cx;
        this.pointer.dragOffsetY = pt.y - rect.cy;
      }
      return;
    }

    this.engine.state.selectedCardUid = null;
  }

  handlePointerUp(pt) {
    const draggingUid = this.pointer.draggingUid;
    this.pointer.draggingUid = null;
    if (draggingUid === null || this.engine.screen !== SCREEN_PLAY) return;

    const movedDist = Math.hypot(pt.x - this.pointer.dragStartX, pt.y - this.pointer.dragStartY);
    const dropSlot = this.findSlotAt(pt);

    if (dropSlot !== -1) {
      if (this.engine.playCardToSlot(draggingUid, dropSlot)) {
        this.sound.playSnap();
      }
      return;
    }

    // If dragged upward onto the table area, snap to first open slot
    if (movedDist > 26 && pt.y < 435) {
      if (this.engine.playCardToFirstOpenSlot(draggingUid)) {
        this.sound.playSnap();
      }
      return;
    }

    // Simple click: toggle select, or double-click / quick-slot if already selected
    if (movedDist <= 14) {
      if (this.engine.state.selectedCardUid === draggingUid) {
        if (this.engine.playCardToFirstOpenSlot(draggingUid)) {
          this.sound.playSnap();
        }
      } else {
        this.engine.selectCard(draggingUid);
      }
    }
  }

  triggerButton(id) {
    if (id === 'start_duel') {
      this.engine.resetMatch(this.engine.rivalIndex, Date.now() & 0xffff, SCREEN_PLAY);
      this.animator.reset();
      this.sound.playDeal();
      return;
    }
    if (id.startsWith('rival_')) {
      const idx = Number(id.split('_')[1]);
      if (Number.isInteger(idx) && idx >= 0 && idx < RIVALS.length) {
        this.engine.rivalIndex = idx;
      }
      return;
    }
    if (id === 'resolve_turn') {
      this.resolveAndAnimate();
      return;
    }
    if (id === 'cycle_selected') {
      if (this.engine.state.selectedCardUid !== null && this.engine.cycleCard(this.engine.state.selectedCardUid)) {
        this.sound.playCycle();
      } else if (this.engine.state.hand.length > 0 && this.engine.cycleCard(this.engine.state.hand[0].uid)) {
        this.sound.playCycle();
      }
      return;
    }
    if (id === 'toggle_mute') {
      this.sound.toggleMute();
      return;
    }
    if (id === 'toggle_rules') {
      this.ui.showRules = !this.ui.showRules;
      return;
    }
    if (id === 'back_title') {
      this.engine.resetMatch(this.engine.rivalIndex, this.engine.seed, SCREEN_TITLE);
      this.animator.reset();
      return;
    }
    if (id === 'play_again') {
      this.engine.resetMatch(this.engine.rivalIndex, (this.engine.seed + 13) & 0xffff, SCREEN_PLAY);
      this.animator.reset();
      this.sound.playDeal();
      return;
    }
    if (id === 'next_rival') {
      const nextIdx = (this.engine.rivalIndex + 1) % RIVALS.length;
      this.engine.resetMatch(nextIdx, (this.engine.seed + 29) & 0xffff, SCREEN_PLAY);
      this.animator.reset();
      this.sound.playDeal();
      return;
    }
    if (id.startsWith('pick_relic_')) {
      const idx = Number(id.split('_')[2]);
      if (this.engine.pickRelic(idx)) {
        const nextIdx = (this.engine.rivalIndex + 1) % RIVALS.length;
        this.engine.resetMatch(nextIdx, (this.engine.seed + 29) & 0xffff, SCREEN_PLAY);
        this.animator.reset();
        this.sound.playDeal();
      }
    }
  }

  resolveAndAnimate() {
    if (this.engine.screen !== SCREEN_PLAY) return;
    const ok = this.engine.resolveTurn();
    if (!ok) return;

    const events = this.engine.consumeEvents();
    for (const ev of events) {
      if (ev.type === 'opponent_hit') {
        this.sound.playStrike();
        this.animator.triggerShake(ev.amount >= 10 ? 10 : 5);
        this.animator.spawnBurst(640, 125, 'ember', 20);
        this.animator.spawnFloatText(640, 95, `-${ev.amount}`, '#fb7185', 1.25);
      } else if (ev.type === 'catalyst') {
        this.sound.playCatalyst();
        this.animator.spawnBurst(640, 315, ev.catalyst.color, 26, 210);
        this.animator.spawnFloatText(640, 265, `${ev.catalyst.name.toUpperCase()}!`, ev.catalyst.color, 1.3);
      } else if (ev.type === 'player_ward') {
        this.sound.playWard();
        this.animator.spawnFloatText(165, 505, `+${ev.amount} WARD`, '#7dd3fc', 1.05);
      } else if (ev.type === 'player_heal') {
        this.animator.spawnFloatText(165, 475, `+${ev.amount} HP`, '#4ade80', 1.05);
      } else if (ev.type === 'player_hit') {
        if (ev.hpDmg > 0) {
          this.animator.triggerShake(6);
          this.animator.spawnFloatText(165, 455, `-${ev.hpDmg} HP`, '#f87171', 1.15);
        } else {
          this.animator.spawnFloatText(165, 455, 'BLOCKED!', '#60a5fa', 1.1);
        }
      } else if (ev.type === 'parry_reflect') {
        this.animator.spawnBurst(640, 125, 'brass', 18);
        this.animator.spawnFloatText(710, 105, `PARRY -${ev.amount}`, '#fde68a', 1.15);
      } else if (ev.type === 'victory') {
        this.sound.playVictory();
        this.animator.spawnVictoryFlourish(1280, 720);
      } else if (ev.type === 'defeat') {
        this.sound.playDefeat();
        this.animator.triggerShake(12);
      }
    }
  }

  handleKeyDown(ev) {
    const key = ev.key.toLowerCase();
    if (key === 'm') {
      this.sound.toggleMute();
      return;
    }
    if (key === 'h') {
      this.ui.showRules = !this.ui.showRules;
      return;
    }

    if (this.engine.screen === SCREEN_TITLE) {
      if (key === 'enter' || key === ' ') {
        ev.preventDefault();
        this.triggerButton('start_duel');
      } else if (key === 'arrowleft' || key === 'arrowright') {
        const delta = key === 'arrowright' ? 1 : -1;
        this.engine.rivalIndex = (this.engine.rivalIndex + delta + RIVALS.length) % RIVALS.length;
      }
      return;
    }

    if (this.engine.screen === SCREEN_WIN || this.engine.screen === SCREEN_LOSS) {
      if (this.engine.screen === SCREEN_WIN && (key === '1' || key === '2' || key === '3')) {
        this.triggerButton(`pick_relic_${Number(key) - 1}`);
        return;
      }
      if (key === 'enter' || key === ' ' || key === 'r') {
        ev.preventDefault();
        this.triggerButton(key === 'r' ? 'play_again' : this.engine.screen === SCREEN_WIN ? 'next_rival' : 'play_again');
      }
      return;
    }

    // Play screen keyboard bindings
    if (key >= '1' && key <= '7') {
      const idx = Number(key) - 1;
      const card = this.engine.state.hand[idx];
      if (card) {
        if (this.engine.state.selectedCardUid === card.uid) {
          if (this.engine.playCardToFirstOpenSlot(card.uid)) this.sound.playSnap();
        } else {
          this.engine.selectCard(card.uid);
        }
      }
      return;
    }

    if (key === 'q' || key === 'w' || key === 'e') {
      const slotMap = { q: 0, w: 1, e: 2 };
      const slotIdx = slotMap[key];
      if (this.engine.state.selectedCardUid !== null) {
        if (this.engine.playCardToSlot(this.engine.state.selectedCardUid, slotIdx)) {
          this.sound.playSnap();
        }
      } else if (this.engine.state.slots[slotIdx]) {
        if (this.engine.unslotCard(slotIdx)) this.sound.playCycle();
      }
      return;
    }

    if (key === 'x') {
      const targetUid = this.engine.state.selectedCardUid ?? this.engine.state.hand[0]?.uid;
      if (targetUid && this.engine.cycleCard(targetUid)) {
        this.sound.playCycle();
      }
      return;
    }

    if (key === ' ' || key === 'enter') {
      ev.preventDefault();
      if (this.engine.state.selectedCardUid !== null) {
        if (this.engine.playCardToFirstOpenSlot(this.engine.state.selectedCardUid)) {
          this.sound.playSnap();
          return;
        }
      }
      this.resolveAndAnimate();
    }
  }
}
