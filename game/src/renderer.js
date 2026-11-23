// High-DPI Canvas renderer for Sigil & Cinder: obsidian-brass table, suit emblems, cards, and HUD.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_H,
  CARD_W,
  MAX_SLOTS,
  OPP_CARD_H,
  OPP_CARD_W,
  PALETTE,
  SUITS,
  SUIT_ORDER,
} from './config.js';
import { CARD_CATALOG } from './cards.js';
import { RELICS, SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './engine.js';
import { RIVALS } from './opponent.js';

export class TableRenderer {
  constructor(ctx, engine, animator, uiState) {
    this.ctx = ctx;
    this.engine = engine;
    this.animator = animator;
    this.ui = uiState;
  }

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  addButton(id, x, y, w, h) {
    this.ui.buttons.push({ id, x, y, w, h });
    return this.ui.hoveredButton === id;
  }

  drawSuitIcon(suitId, cx, cy, radius, overrideColor = null) {
    const ctx = this.ctx;
    const suit = SUITS[suitId] || SUITS.brass;
    const color = overrideColor || suit.color;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.strokeStyle = suit.bright;
    ctx.lineWidth = 1.4;

    if (suit.shape === 'flame') {
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.bezierCurveTo(radius * 0.7, -radius * 0.3, radius * 0.9, radius * 0.45, 0, radius);
      ctx.bezierCurveTo(-radius * 0.9, radius * 0.45, -radius * 0.7, -radius * 0.3, 0, -radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.35);
      ctx.bezierCurveTo(radius * 0.32, 0, radius * 0.35, radius * 0.45, 0, radius * 0.7);
      ctx.bezierCurveTo(-radius * 0.35, radius * 0.45, -radius * 0.32, 0, 0, -radius * 0.35);
      ctx.fill();
    } else if (suit.shape === 'drop') {
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.bezierCurveTo(radius * 0.85, -radius * 0.1, radius * 0.85, radius * 0.95, 0, radius);
      ctx.bezierCurveTo(-radius * 0.85, radius * 0.95, -radius * 0.85, -radius * 0.1, 0, -radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(-radius * 0.18, radius * 0.28, radius * 0.36, Math.PI * 0.85, Math.PI * 1.45);
      ctx.stroke();
    } else if (suit.shape === 'leaf') {
      ctx.beginPath();
      for (let i = 0; i < 3; i += 1) {
        const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const lx = Math.cos(a) * radius * 0.56;
        const ly = Math.sin(a) * radius * 0.56;
        ctx.moveTo(lx + radius * 0.44, ly);
        ctx.arc(lx, ly, radius * 0.44, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#dcfce7';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Brass sun-gear
      const teeth = 8;
      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i += 1) {
        const a = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? radius : radius * 0.66;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1f1708';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawRivalPortrait(rival, cx, cy, r) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    // Outer medallion ring
    const bg = ctx.createRadialGradient(0, -r * 0.2, 2, 0, 0, r);
    bg.addColorStop(0, rival.accent + '66');
    bg.addColorStop(0.7, '#16202c');
    bg.addColorStop(1, '#0b1118');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = PALETTE.goldBright;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r - 3.5, 0, Math.PI * 2);
    ctx.clip();

    // Shoulders / cloak silhouette
    ctx.fillStyle = rival.id === 'vespera' ? '#7c2d12' : rival.id === 'maren' ? '#0c4a6e' : '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.85, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / hood
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -r * 0.06, r * 0.44, 0, Math.PI * 2);
    ctx.fill();

    if (rival.id === 'vespera') {
      // Copper alchemist hood & brass goggles
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-r * 0.16, -r * 0.08, r * 0.16, 0, Math.PI * 2);
      ctx.arc(r * 0.16, -r * 0.08, r * 0.16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-r * 0.16, -r * 0.08, r * 0.09, 0, Math.PI * 2);
      ctx.arc(r * 0.16, -r * 0.08, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -r * 0.06, r * 0.52, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
    } else if (rival.id === 'maren') {
      // Sea-glass visor & azure coral crown
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-r * 0.34, -r * 0.14);
      ctx.lineTo(0, -r * 0.02);
      ctx.lineTo(r * 0.34, -r * 0.14);
      ctx.lineTo(r * 0.24, r * 0.06);
      ctx.lineTo(-r * 0.24, r * 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Coral spikes
      for (const sx of [-0.28, 0, 0.28]) {
        ctx.beginPath();
        ctx.moveTo(sx * r, -r * 0.35);
        ctx.lineTo(sx * r * 1.15, -r * 0.7);
        ctx.stroke();
      }
    } else {
      // Kaelen: Crimson flame crown & ember eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-r * 0.42, -r * 0.26);
      ctx.lineTo(-r * 0.25, -r * 0.72);
      ctx.lineTo(0, -r * 0.42);
      ctx.lineTo(r * 0.25, -r * 0.76);
      ctx.lineTo(r * 0.42, -r * 0.26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-r * 0.22, -r * 0.08, r * 0.14, r * 0.07);
      ctx.fillRect(r * 0.08, -r * 0.08, r * 0.14, r * 0.07);
    }

    ctx.restore();
  }

  drawCardArtwork(card, cx, cy, size) {
    const ctx = this.ctx;
    const suit = SUITS[card.suit] || SUITS.brass;
    ctx.save();
    ctx.translate(cx, cy);

    // Rich dark heraldic medallion backing inside ivory card
    const medGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, size * 1.15);
    medGrad.addColorStop(0, suit.color + '55');
    medGrad.addColorStop(0.75, '#111824');
    medGrad.addColorStop(1, '#090d14');
    ctx.fillStyle = medGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = PALETTE.gold;
    ctx.stroke();

    const eff = card.effect || card;
    if (card.suit === 'ember') {
      // Solid blazing phoenix/flame spear crest
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.88);
      ctx.lineTo(size * 0.55, size * 0.15);
      ctx.lineTo(0, size * 0.78);
      ctx.lineTo(-size * 0.55, size * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.76);
      ctx.bezierCurveTo(size * 0.52, -size * 0.1, size * 0.42, size * 0.52, 0, size * 0.72);
      ctx.bezierCurveTo(-size * 0.42, size * 0.52, -size * 0.52, -size * 0.1, 0, -size * 0.76);
      ctx.fill();

      ctx.fillStyle = eff.pierce ? '#fef08a' : '#fb923c';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.48);
      ctx.lineTo(size * 0.24, size * 0.12);
      ctx.lineTo(0, size * 0.54);
      ctx.lineTo(-size * 0.24, size * 0.12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(0, size * 0.1, size * 0.13, 0, Math.PI * 2);
      ctx.fill();
    } else if (card.suit === 'tide') {
      // Solid heraldic wave shield & crescent
      ctx.fillStyle = '#075985';
      ctx.beginPath();
      ctx.moveTo(-size * 0.56, -size * 0.58);
      ctx.lineTo(size * 0.56, -size * 0.58);
      ctx.lineTo(size * 0.52, size * 0.15);
      ctx.quadraticCurveTo(0, size * 0.82, 0, size * 0.82);
      ctx.quadraticCurveTo(0, size * 0.82, -size * 0.52, size * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -size * 0.02, size * 0.38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.36);
      ctx.bezierCurveTo(size * 0.28, -size * 0.02, size * 0.28, size * 0.36, 0, size * 0.42);
      ctx.bezierCurveTo(-size * 0.28, size * 0.36, -size * 0.28, -size * 0.02, 0, -size * 0.36);
      ctx.fill();
    } else if (card.suit === 'briar') {
      // Solid emerald botanical crown & golden thorns
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.68, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < 3; i += 1) {
        const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.34, size * 0.22, size * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#bbf7d0';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Solid gold astrolabe prism & interlocking gear
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.68, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      const teeth = 8;
      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i += 1) {
        const a = (i * Math.PI) / teeth;
        const rad = i % 2 === 0 ? size * 0.72 : size * 0.46;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.34);
      ctx.lineTo(size * 0.34, 0);
      ctx.lineTo(0, size * 0.34);
      ctx.lineTo(-size * 0.34, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawCardBack(cx, cy, w, h, angle = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.roundRect(-w / 2 + 3, -h / 2 + 5, w, h, 9);
    ctx.fill();

    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, '#1b2836');
    grad.addColorStop(1, '#0f1720');
    ctx.fillStyle = grad;
    this.roundRect(-w / 2, -h / 2, w, h, 9);
    ctx.fill();

    ctx.strokeStyle = PALETTE.goldDim;
    ctx.lineWidth = 2;
    this.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 8);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(224, 179, 84, 0.35)';
    ctx.lineWidth = 1.2;
    this.roundRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 5);
    ctx.stroke();

    // Inner diamond sigil
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.24);
    ctx.lineTo(w * 0.22, 0);
    ctx.lineTo(0, h * 0.24);
    ctx.lineTo(-w * 0.22, 0);
    ctx.closePath();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCardFace(card, cx, cy, w, h, options = {}) {
    const ctx = this.ctx;
    const {
      angle = 0,
      scale = 1,
      playable = true,
      selected = false,
      hovered = false,
      compact = false,
      apexBonus = 0,
    } = options;
    const suit = SUITS[card.suit] || SUITS.brass;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // High-contrast outer glow / drop shadow
    if (selected) {
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 18;
    } else if (hovered) {
      ctx.shadowColor = suit.bright;
      ctx.shadowBlur = 14;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
    }

    // Illuminated Ivory Parchment Card Body (high contrast against dark felt table!)
    const bgGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    bgGrad.addColorStop(0, '#fdf9f0');
    bgGrad.addColorStop(0.65, '#f2e9d5');
    bgGrad.addColorStop(1, '#e3d5b8');
    ctx.fillStyle = bgGrad;
    this.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Outer suit/gold border + inner gold filigree rule
    ctx.lineWidth = selected ? 3.5 : hovered ? 3 : 2.5;
    ctx.strokeStyle = selected ? '#fde047' : hovered ? suit.bright : playable ? suit.color : '#64748b';
    this.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.stroke();

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#c89b3c';
    this.roundRect(-w / 2 + 3.5, -h / 2 + 3.5, w - 7, h - 7, 7);
    ctx.stroke();

    // Rich Suit-Colored Header Banner
    const headerH = compact ? 25 : 29;
    const bannerColors = {
      ember: '#991b1b',
      tide: '#075985',
      briar: '#166534',
      brass: '#92400e',
    };
    ctx.fillStyle = bannerColors[card.suit] || '#334155';
    this.roundRect(-w / 2 + 5, -h / 2 + 5, w - 10, headerH, 6);
    ctx.fill();

    // Suit Icon top-left
    const iconR = compact ? 8 : 10;
    const iconX = -w / 2 + iconR + 8;
    const iconY = -h / 2 + 5 + headerH / 2;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconR + 2.5, 0, Math.PI * 2);
    ctx.fill();
    this.drawSuitIcon(card.suit, iconX, iconY, iconR * 0.85);

    // Cost Octagon / Diamond top-right
    const costR = compact ? 11 : 13.5;
    const costX = w / 2 - costR - 6;
    const costY = -h / 2 + 5 + headerH / 2;
    ctx.fillStyle = playable ? '#fde047' : '#fca5a5';
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      const px = costX + Math.cos(a) * costR;
      const py = costY + Math.sin(a) * costR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = `900 ${compact ? 12.5 : 14.5}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(card.cost), costX, costY + 0.5);

    // Card Name centered between icon and cost
    const nameMaxW = w - (iconR * 2 + costR * 2 + 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${compact ? 10.5 : 11.5}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(card.name, -1, -h / 2 + 5 + headerH / 2 + 0.5, nameMaxW);

    // Dark Heraldic Artwork Window
    const artY = compact ? -5 : -5;
    const artSize = compact ? 15.5 : 25;
    const artH = compact ? 36 : 56;
    ctx.fillStyle = '#0c131d';
    this.roundRect(-w / 2 + 8, artY - artH / 2, w - 16, artH, 6);
    ctx.fill();
    ctx.strokeStyle = '#b48a35';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    this.drawCardArtwork(card, 0, artY, artSize);

    // Big Dark-Ink Power Number on Ivory Parchment
    const powerY = h / 2 - (compact ? 29 : 38);
    const displayPower = card.power + apexBonus;
    ctx.font = `900 ${compact ? 19 : 26}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = apexBonus > 0 ? '#b45309' : '#0f172a';
    ctx.fillText(apexBonus > 0 ? `${displayPower} (+${apexBonus})` : String(displayPower), 0, powerY);

    // Solid Suit-Colored Tag Pill at bottom
    const tagH = compact ? 18 : 22;
    const tagY = h / 2 - (compact ? 13 : 15);
    ctx.fillStyle = bannerColors[card.suit] || '#1e293b';
    this.roundRect(-w / 2 + 7, tagY - tagH / 2, w - 14, tagH, 5);
    ctx.fill();
    ctx.strokeStyle = '#c89b3c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${compact ? 10 : 11}px system-ui, sans-serif`;
    ctx.fillText(card.tag, 0, tagY + 0.5, w - 16);

    if (!playable) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
      this.roundRect(-w / 2, -h / 2, w, h, 10);
      ctx.fill();
    }

    ctx.restore();
  }

  syncCardTargets(snap = false) {
    const s = this.engine.state;
    const deckX = 105;
    const deckY = 305;

    // Player hand fan geometry
    const handCount = s.hand.length;
    const fanCenterX = 640;
    const fanBaseY = 612;
    const spacing = Math.min(118, 630 / Math.max(1, handCount));
    this.ui.handRects = [];

    for (let i = 0; i < handCount; i += 1) {
      const card = s.hand[i];
      const offsetIdx = i - (handCount - 1) / 2;
      const cx = fanCenterX + offsetIdx * spacing;
      const arcLift = Math.abs(offsetIdx) * Math.abs(offsetIdx) * 3.8;
      const isSelected = s.selectedCardUid === card.uid;
      const isHovered = this.ui.hoveredHandUid === card.uid;
      const cy = fanBaseY + arcLift - (isSelected ? 26 : isHovered ? 16 : 0);
      const angle = offsetIdx * 0.045;
      const scale = isSelected ? 1.09 : isHovered ? 1.05 : 1;

      this.animator.ensureCardVisual(card.uid, deckX, deckY, -0.2);
      this.animator.setCardTarget(card.uid, cx, cy, angle, scale, snap);
      this.ui.handRects.push({ uid: card.uid, cx, cy });
    }

    // Player 3 Ritual Slots
    const slotXs = [435, 595, 755];
    const slotY = 330;
    this.ui.slotRects = [];
    for (let i = 0; i < MAX_SLOTS; i += 1) {
      this.ui.slotRects.push({
        x: slotXs[i] - CARD_W / 2 - 8,
        y: slotY - CARD_H / 2 - 8,
        w: CARD_W + 16,
        h: CARD_H + 16,
        cx: slotXs[i],
        cy: slotY,
      });
      const slotted = s.slots[i];
      if (slotted) {
        this.animator.ensureCardVisual(slotted.uid, slotXs[i], slotY + 40, 0);
        this.animator.setCardTarget(slotted.uid, slotXs[i], slotY, 0, 1, snap);
      }
    }
  }

  drawTableBackground() {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(640, 350, 60, 640, 360, 760);
    grad.addColorStop(0, PALETTE.feltCenter);
    grad.addColorStop(0.65, PALETTE.feltEdge);
    grad.addColorStop(1, PALETTE.bgDeep);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle brass border frame
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.25)';
    ctx.lineWidth = 2;
    this.roundRect(12, 12, CANVAS_WIDTH - 24, CANVAS_HEIGHT - 24, 14);
    ctx.stroke();

    // Central arcane filigree circle
    ctx.save();
    ctx.translate(595, 315);
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 165, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 125, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawBar(x, y, w, h, val, maxVal, fillColor, label) {
    const ctx = this.ctx;
    const ratio = Math.max(0, Math.min(1, val / Math.max(1, maxVal)));
    ctx.fillStyle = 'rgba(8, 13, 18, 0.85)';
    this.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (ratio > 0) {
      ctx.fillStyle = fillColor;
      this.roundRect(x + 2, y + 2, Math.max(8, (w - 4) * ratio), h - 4, 4);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
  }

  drawTopHud() {
    const ctx = this.ctx;
    const s = this.engine.state;
    const rival = s.rival;

    // Header strip
    ctx.fillStyle = 'rgba(9, 16, 22, 0.86)';
    this.roundRect(22, 18, CANVAS_WIDTH - 44, 46, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Title & Turn & Relic
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '900 16px Georgia, serif';
    ctx.fillText('SIGIL & CINDER', 36, 41);

    ctx.fillStyle = '#1e293b';
    this.roundRect(184, 27, 74, 28, 6);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goldDim;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ivory;
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`TURN ${s.turn}`, 221, 41);

    if (this.engine.activeRelic) {
      const rName = this.engine.activeRelic.name.toUpperCase();
      ctx.fillStyle = '#291c09';
      this.roundRect(266, 27, 178, 28, 6);
      ctx.fill();
      ctx.strokeStyle = PALETTE.gold;
      ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.font = '800 10.5px system-ui, sans-serif';
      ctx.fillText(`★ RELIC: ${rName}`, 355, 41);
    }

    // Rival Name & HP Bar
    ctx.textAlign = 'right';
    ctx.fillStyle = rival.accent;
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.fillText(`${rival.name.toUpperCase()}`, 528, 41);

    this.drawBar(
      538,
      28,
      210,
      26,
      s.opponent.hp,
      s.opponent.maxHp,
      '#dc2626',
      `RIVAL HP ${s.opponent.hp} / ${s.opponent.maxHp}`
    );

    // Rival status pills
    let pillX = 758;
    if (s.opponent.ward > 0) {
      ctx.fillStyle = '#1d4ed8';
      this.roundRect(pillX, 28, 72, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#dbeafe';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`WARD ${s.opponent.ward}`, pillX + 36, 41);
      pillX += 78;
    }
    if (s.opponent.burn > 0) {
      ctx.fillStyle = '#9a3412';
      this.roundRect(pillX, 28, 68, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#fed7aa';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`BURN ${s.opponent.burn}`, pillX + 34, 41);
      pillX += 74;
    }
    if (s.opponent.venom > 0) {
      ctx.fillStyle = '#14532d';
      this.roundRect(pillX, 28, 72, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#bbf7d0';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`VENOM ${s.opponent.venom}`, pillX + 36, 41);
    }

    // Score & utility buttons
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.fillText(`SCORE ${s.score}`, 1068, 41);

    const rulesHover = this.addButton('toggle_rules', 1084, 27, 74, 28);
    ctx.fillStyle = rulesHover ? '#2b3d4f' : '#182430';
    this.roundRect(1084, 27, 74, 28, 6);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goldDim;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ivory;
    ctx.textAlign = 'center';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText('[H] RULES', 1121, 41);

    const menuHover = this.addButton('back_title', 1166, 27, 76, 28);
    ctx.fillStyle = menuHover ? '#3b2428' : '#182430';
    this.roundRect(1166, 27, 76, 28, 6);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goldDim;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ivory;
    ctx.fillText('TITLE', 1204, 41);
  }

  drawOpponentRow(preview) {
    const ctx = this.ctx;
    const s = this.engine.state;
    const rival = s.rival;

    // Left: Rival Portrait Medallion + Passive + Reactive Banter Bubble
    ctx.fillStyle = 'rgba(11, 19, 27, 0.8)';
    this.roundRect(30, 70, 325, 138, 10);
    ctx.fill();
    ctx.strokeStyle = rival.accent + '88';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    this.drawRivalPortrait(rival, 74, 114, 32);

    ctx.textAlign = 'left';
    ctx.fillStyle = rival.accent;
    ctx.font = '900 12.5px system-ui, sans-serif';
    ctx.fillText(`${rival.name.toUpperCase()} • ${rival.title}`, 116, 88);

    ctx.fillStyle = '#fde68a';
    ctx.font = '800 10.5px system-ui, sans-serif';
    ctx.fillText(`PASSIVE: ${rival.passiveName}`, 116, 106);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 10.5px system-ui, sans-serif';
    ctx.fillText(rival.passiveDesc, 116, 122, 228);

    // Ivory Speech Bubble for Rival Banter
    ctx.fillStyle = '#f8f3e6';
    this.roundRect(42, 154, 300, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#c89b3c';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.font = 'italic 700 11px system-ui, sans-serif';
    ctx.fillText(`"${s.rivalBanter}"`, 52, 176, 282);

    // Center: Opponent Hand + Opponent Telegraphed Plays
    ctx.fillStyle = 'rgba(11, 19, 27, 0.76)';
    this.roundRect(366, 70, 544, 138, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.35)';
    ctx.stroke();

    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '800 10.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`OPPONENT HAND (${s.opponentHand.length})`, 442, 85);

    const handCount = s.opponentHand.length;
    for (let i = 0; i < handCount; i += 1) {
      const offset = i - (handCount - 1) / 2;
      const cx = 442 + offset * 34;
      const cy = 146 + Math.abs(offset) * 3;
      this.drawCardBack(cx, cy, 62, 88, offset * 0.09);
    }

    ctx.fillStyle = '#fca5a5';
    ctx.font = '800 10.5px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPPONENT TELEGRAPHED PLAYS (COUNTERABLE)', 535, 85);

    const oppXs = [586, 702, 818];
    for (let i = 0; i < MAX_SLOTS; i += 1) {
      const oppCard = s.opponentSlots[i];
      if (oppCard) {
        this.drawCardFace(oppCard, oppXs[i], 147, OPP_CARD_W, 110, {
          playable: true,
          compact: true,
        });
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.setLineDash([4, 4]);
        this.roundRect(oppXs[i] - OPP_CARD_W / 2, 147 - 55, OPP_CARD_W, 110, 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Right: Incoming Threat Summary box
    const intent = preview.oppIntent;
    ctx.fillStyle = 'rgba(38, 15, 21, 0.86)';
    this.roundRect(920, 70, 330, 138, 10);
    ctx.fill();
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fda4af';
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.fillText('INCOMING RIVAL INTENT', 938, 94);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px system-ui, sans-serif';
    ctx.fillText(`${intent.effectiveDmg} DMG`, 938, 128);

    if (intent.effectiveDmg < intent.rawDmg) {
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.fillText(`(Chilled from ${intent.rawDmg})`, 1058, 128);
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 13px system-ui, sans-serif';
    const subParts = [];
    if (intent.ward > 0) subParts.push(`+${intent.ward} Ward`);
    if (intent.burn > 0) subParts.push(`+${intent.burn} Burn`);
    if (intent.venom > 0) subParts.push(`+${intent.venom} Venom`);
    if (intent.heal > 0) subParts.push(`+${intent.heal} Heal`);
    ctx.fillText(subParts.length ? subParts.join('  •  ') : 'Pure Strike', 938, 160);

    ctx.fillStyle = '#fde68a';
    ctx.font = '700 11.5px system-ui, sans-serif';
    const counterTip =
      intent.effectiveDmg >= 8
        ? 'Counter: Play Tide Ward/Chill or Brass Parry!'
        : intent.ward >= 5
          ? 'Counter: Pair Ember+Tide (Steam) or Pierce!'
          : 'Counter: Chain Catalysts for burst!';
    ctx.fillText(counterTip, 938, 192);
  }

  drawCenterArena(preview, pointer) {
    const ctx = this.ctx;
    const s = this.engine.state;

    // Deck & Discard piles on left
    ctx.fillStyle = 'rgba(11, 19, 27, 0.72)';
    this.roundRect(30, 232, 235, 174, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.24)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Deck stack
    this.drawCardBack(92, 310, 78, 110, -0.04);
    this.drawCardBack(96, 306, 78, 110, 0);
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DECK (${s.deck.length})`, 96, 384);

    // Discard stack
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    this.roundRect(160, 251, 78, 110, 8);
    ctx.stroke();
    if (s.discard.length > 0) {
      const topDiscard = s.discard[s.discard.length - 1];
      this.drawCardFace(topDiscard, 199, 306, 78, 110, { playable: false, compact: true });
    }
    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText(`DISC (${s.discard.length})`, 199, 384);

    // 3 Player Ritual Slots
    const slotXs = [435, 595, 755];
    const slotY = 330;
    const keys = ['Q', 'W', 'E'];

    // Prominent Combo / Catalyst / Resonance Banner Pills above Ritual Slots
    const bannerBadges = [];
    for (const cat of preview.synergy.catalysts) {
      bannerBadges.push({ label: `⚡ CATALYST: ${cat.name.toUpperCase()}`, color: cat.color });
    }
    for (const res of preview.synergy.resonances) {
      bannerBadges.push({ label: `✦ HARMONY: ${res.suit.toUpperCase()} x${res.count}`, color: SUITS[res.suit]?.bright || '#fde047' });
    }
    if (preview.isLethal) {
      bannerBadges.push({ label: `★ LETHAL CLASH (${preview.totalDmg} DMG)`, color: '#fbbf24' });
    }
    if (bannerBadges.length > 0) {
      const pillW = 190;
      const gap = 10;
      const totalW = bannerBadges.length * pillW + (bannerBadges.length - 1) * gap;
      const startX = 595 - totalW / 2;
      bannerBadges.slice(0, 3).forEach((badge, idx) => {
        const bx = startX + idx * (pillW + gap);
        ctx.fillStyle = '#0f172a';
        this.roundRect(bx, 214, pillW, 24, 6);
        ctx.fill();
        ctx.strokeStyle = badge.color;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.fillStyle = badge.color;
        ctx.font = '800 10.5px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badge.label, bx + pillW / 2, 226.5, pillW - 10);
      });
    }

    // Draw Catalyst combo bridges behind slots
    for (const cat of preview.synergy.catalysts) {
      const [a, b] = cat.pair;
      const x1 = slotXs[a];
      const x2 = slotXs[b];
      ctx.save();
      ctx.strokeStyle = cat.color;
      ctx.lineWidth = 6;
      ctx.shadowColor = cat.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(x1, slotY);
      ctx.lineTo(x2, slotY);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < MAX_SLOTS; i += 1) {
      const sx = slotXs[i];
      const isApex = i === 1;
      const isHovered = this.ui.hoveredSlot === i;
      ctx.fillStyle = isHovered
        ? 'rgba(224, 179, 84, 0.18)'
        : isApex
          ? 'rgba(46, 33, 9, 0.65)'
          : PALETTE.slotBg;
      this.roundRect(sx - CARD_W / 2 - 6, slotY - CARD_H / 2 - 6, CARD_W + 12, CARD_H + 12, 11);
      ctx.fill();
      ctx.strokeStyle = isHovered || isApex ? PALETTE.goldBright : 'rgba(224, 179, 84, 0.38)';
      ctx.lineWidth = isHovered || isApex ? 2.4 : 1.4;
      ctx.stroke();

      if (isApex) {
        ctx.fillStyle = '#f59e0b';
        this.roundRect(sx - 44, slotY + CARD_H / 2 + 7, 88, 18, 5);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`★ APEX +${preview.apexBonus}`, sx, slotY + CARD_H / 2 + 16.5);
      }

      if (!s.slots[i]) {
        ctx.fillStyle = isApex ? PALETTE.goldBright : 'rgba(224, 179, 84, 0.52)';
        ctx.font = '800 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isApex ? `APEX SLOT [${keys[i]}]` : `SLOT ${i + 1} [${keys[i]}]`, sx, slotY - 8);
        ctx.fillStyle = 'rgba(159, 179, 192, 0.68)';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText(isApex ? `+${preview.apexBonus} Power Bonus` : 'Click or Drop', sx, slotY + 14);
      } else {
        const card = s.slots[i];
        const vis = this.animator.cardVisuals.get(card.uid);
        const cx = vis ? vis.x : sx;
        const cy = vis ? vis.y : slotY;
        this.drawCardFace(card, cx, cy, CARD_W, CARD_H, {
          playable: true,
          hovered: isHovered,
          apexBonus: isApex ? preview.apexBonus : 0,
        });
      }
    }

    // Right: Live Clash Output & Resolve Button
    ctx.fillStyle = preview.isLethal ? 'rgba(42, 19, 15, 0.92)' : 'rgba(11, 19, 27, 0.88)';
    this.roundRect(920, 232, 330, 174, 10);
    ctx.fill();
    ctx.strokeStyle = preview.isLethal ? '#fbbf24' : PALETTE.goldDim;
    ctx.lineWidth = preview.isLethal ? 2 : 1.4;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = preview.isLethal ? '#fde047' : PALETTE.goldBright;
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText(preview.isLethal ? '★ LETHAL CLASH READY' : 'YOUR RITUAL OUTPUT', 938, 252);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px system-ui, sans-serif';
    ctx.fillText(
      `⚔️ ${preview.totalDmg} DMG    🛡️ +${preview.totalWard} WARD`,
      938,
      280
    );

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 12.5px system-ui, sans-serif';
    const bonuses = [];
    if (preview.totalHeal > 0) bonuses.push(`💚 +${preview.totalHeal} Heal`);
    if (preview.totalParry > 0) bonuses.push(`🛡 Parry ${preview.totalParry}`);
    if (preview.totalChill > 0) bonuses.push(`❄ Chill -${preview.totalChill}`);
    if (preview.totalBurn > 0) bonuses.push(`🔥 Burn +${preview.totalBurn}`);
    if (preview.totalVenom > 0) bonuses.push(`☠ Venom +${preview.totalVenom}`);
    ctx.fillText(
      bonuses.length ? bonuses.slice(0, 3).join('  •  ') : 'Slot cards to build Catalyst combos',
      938,
      307
    );

    const resolveHover = this.addButton('resolve_turn', 936, 336, 298, 52);
    const hasCards = s.slots.some((c) => c !== null);
    const btnGrad = ctx.createLinearGradient(936, 336, 936, 388);
    if (preview.isLethal) {
      btnGrad.addColorStop(0, '#fde047');
      btnGrad.addColorStop(0.5, '#f59e0b');
      btnGrad.addColorStop(1, '#b45309');
    } else if (hasCards) {
      btnGrad.addColorStop(0, resolveHover ? '#fbbf24' : '#d97706');
      btnGrad.addColorStop(1, resolveHover ? '#d97706' : '#92400e');
    } else {
      btnGrad.addColorStop(0, resolveHover ? '#334155' : '#1e293b');
      btnGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = btnGrad;
    this.roundRect(936, 336, 298, 52, 8);
    ctx.fill();
    ctx.strokeStyle = preview.isLethal ? '#fef9c3' : hasCards ? '#fde68a' : '#64748b';
    ctx.lineWidth = preview.isLethal ? 2.4 : 1.8;
    ctx.stroke();

    ctx.fillStyle = hasCards ? '#111827' : '#e2e8f0';
    ctx.font = '900 14.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      preview.isLethal
        ? 'DEAL LETHAL CLASH  [SPACE]'
        : hasCards
          ? 'RESOLVE CLASH  [SPACE]'
          : 'END TURN  [SPACE]',
      1085,
      362
    );

    // Dragging ghost highlight if pointer is dragging
    if (pointer && pointer.draggingUid !== null) {
      const dragged = s.hand.find((c) => c.uid === pointer.draggingUid);
      if (dragged) {
        this.drawCardFace(dragged, pointer.x, pointer.y, CARD_W, CARD_H, {
          playable: this.engine.canPlayCard(dragged),
          selected: true,
          scale: 1.08,
        });
      }
    }
  }

  drawPlayerZone() {
    const ctx = this.ctx;
    const s = this.engine.state;
    const p = s.player;

    // Left: Player Vitals & Aether
    ctx.fillStyle = 'rgba(11, 19, 27, 0.86)';
    this.roundRect(30, 428, 252, 262, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.3)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText('YOUR VITALS', 48, 449);

    this.drawBar(48, 466, 216, 28, p.hp, p.maxHp, '#16a34a', `YOUR HP ${p.hp} / ${p.maxHp}`);

    // Ward & Statuses
    ctx.fillStyle = '#1e3a8a';
    this.roundRect(48, 504, 102, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#bfdbfe';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`WARD ${p.ward}`, 99, 517);

    ctx.fillStyle = p.burn + p.venom > 0 ? '#7f1d1d' : '#1e293b';
    this.roundRect(160, 504, 104, 26, 6);
    ctx.fill();
    ctx.fillStyle = p.burn + p.venom > 0 ? '#fecaca' : '#94a3b8';
    ctx.fillText(
      p.burn + p.venom > 0 ? `B:${p.burn} V:${p.venom}` : 'STATUS OK',
      212,
      517
    );

    // Aether Orbs
    ctx.textAlign = 'left';
    ctx.fillStyle = '#bae6fd';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText(`AETHER  ${p.aether} / ${p.maxAether}`, 48, 554);

    for (let i = 0; i < Math.max(p.maxAether, p.aether); i += 1) {
      const ox = 58 + i * 28;
      const oy = 579;
      const filled = i < p.aether;
      ctx.beginPath();
      ctx.arc(ox, oy, 10, 0, Math.PI * 2);
      ctx.fillStyle = filled ? '#38bdf8' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = filled ? '#e0f2fe' : '#475569';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // Cycle button
    const cycleHover = this.addButton('cycle_selected', 48, 616, 216, 36);
    ctx.fillStyle = p.cyclesLeft > 0 ? (cycleHover ? '#1e3a5f' : '#14263d') : '#151b24';
    this.roundRect(48, 616, 216, 36, 7);
    ctx.fill();
    ctx.strokeStyle = p.cyclesLeft > 0 ? '#38bdf8' : '#334155';
    ctx.stroke();
    ctx.fillStyle = p.cyclesLeft > 0 ? '#e0f2fe' : '#64748b';
    ctx.textAlign = 'center';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillText(`CYCLE CARD [X] (${p.cyclesLeft} LEFT)`, 156, 634);

    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '600 10.5px system-ui, sans-serif';
    ctx.fillText('Right-click hand card to Cycle (+1 Aether)', 156, 672);

    // Center: Player Fanned Hand
    for (let i = 0; i < s.hand.length; i += 1) {
      const card = s.hand[i];
      if (this.ui.hoveredHandUid === card.uid || s.selectedCardUid === card.uid) continue;
      const vis = this.animator.cardVisuals.get(card.uid);
      if (!vis) continue;
      this.drawCardFace(card, vis.x, vis.y, CARD_W, CARD_H, {
        angle: vis.angle,
        scale: vis.scale,
        playable: this.engine.canPlayCard(card),
      });
    }
    // Draw hovered/selected hand card on top so it never gets clipped
    for (let i = 0; i < s.hand.length; i += 1) {
      const card = s.hand[i];
      const isSelected = s.selectedCardUid === card.uid;
      const isHovered = this.ui.hoveredHandUid === card.uid;
      if (!isSelected && !isHovered) continue;
      const vis = this.animator.cardVisuals.get(card.uid);
      if (!vis) continue;
      this.drawCardFace(card, vis.x, vis.y, CARD_W, CARD_H, {
        angle: vis.angle,
        scale: vis.scale,
        playable: this.engine.canPlayCard(card),
        selected: isSelected,
        hovered: isHovered,
      });
    }

    // Right: Log & Controls
    ctx.fillStyle = 'rgba(11, 19, 27, 0.86)';
    this.roundRect(1018, 428, 232, 262, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 179, 84, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '800 11.5px system-ui, sans-serif';
    ctx.fillText('CHRONICLE & CONTROLS', 1034, 449);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 11.5px system-ui, sans-serif';
    for (let i = 0; i < Math.min(4, s.lastLog.length); i += 1) {
      ctx.fillText(s.lastLog[i], 1034, 478 + i * 24, 202);
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath();
    ctx.moveTo(1034, 578);
    ctx.lineTo(1234, 578);
    ctx.stroke();

    const hints = [
      '[1-7] Select  •  [Q/W/E] Slot',
      '[X] Cycle (+1 Aether & Draw)',
      '[Space] Resolve Clash',
      '[H] Catalyst Guide  •  [M] Mute',
    ];
    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '600 11px system-ui, sans-serif';
    hints.forEach((line, idx) => {
      ctx.fillText(line, 1034, 600 + idx * 21);
    });
  }

  drawParticlesAndTexts() {
    const ctx = this.ctx;
    for (const p of this.animator.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ft of this.animator.floatTexts) {
      const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${Math.round(20 * ft.scale)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawTitleScreen() {
    const ctx = this.ctx;
    this.drawTableBackground();

    // Arcane occult ring glow in title screen background
    const centerGrad = ctx.createRadialGradient(640, 200, 20, 640, 200, 360);
    centerGrad.addColorStop(0, 'rgba(224, 179, 84, 0.16)');
    centerGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.08)');
    centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(640, 200, 360, 0, Math.PI * 2);
    ctx.fill();

    // Decorative fanned showcase cards in top-center
    const showcase = [
      { card: CARD_CATALOG.pyre_nova, x: 475, y: 195, angle: -0.22 },
      { card: CARD_CATALOG.chronos_seal, x: 640, y: 175, angle: 0 },
      { card: CARD_CATALOG.abyssal_surge, x: 805, y: 195, angle: 0.22 },
    ];
    for (const item of showcase) {
      this.drawCardFace(item.card, item.x, item.y, 134, 188, {
        angle: item.angle,
        playable: true,
      });
    }

    // Center Title Banner
    ctx.fillStyle = 'rgba(9, 16, 22, 0.9)';
    this.roundRect(200, 285, 880, 405, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '900 48px Georgia, serif';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;
    ctx.fillText('SIGIL & CINDER', 640, 340);
    ctx.shadowBlur = 0;

    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '800 15px system-ui, sans-serif';
    ctx.fillText(
      'TACTICAL ARCANE CARD DUEL  •  READ INTENTS, CHAIN CATALYSTS, BREAK THE RIVAL',
      640,
      376
    );

    // 4 Suit Legend Badges
    SUIT_ORDER.forEach((suitId, idx) => {
      const suit = SUITS[suitId];
      const bx = 242 + idx * 202;
      const by = 402;
      ctx.fillStyle = suit.dark;
      this.roundRect(bx, by, 192, 46, 8);
      ctx.fill();
      ctx.strokeStyle = suit.border;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      this.drawSuitIcon(suitId, bx + 22, by + 23, 11);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillText(suit.label, bx + 42, by + 17);
      ctx.fillStyle = suit.bright;
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.fillText(suit.role, bx + 42, by + 34);
    });

    // Rival Selector Cards
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.ivory;
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.fillText('CHOOSE YOUR CHALLENGER', 640, 474);

    RIVALS.forEach((rival, idx) => {
      const rx = 246 + idx * 268;
      const ry = 490;
      const isSelected = this.engine.rivalIndex === idx;
      const hovered = this.addButton(`rival_${idx}`, rx, ry, 254, 98);

      ctx.fillStyle = isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 35, 0.85)';
      this.roundRect(rx, ry, 254, 98, 10);
      ctx.fill();
      ctx.strokeStyle = isSelected ? PALETTE.goldBright : hovered ? rival.accent : '#334155';
      ctx.lineWidth = isSelected ? 2.5 : 1.4;
      ctx.stroke();

      this.drawRivalPortrait(rival, rx + 36, ry + 48, 24);

      ctx.textAlign = 'left';
      ctx.fillStyle = rival.accent;
      ctx.font = '900 14px system-ui, sans-serif';
      ctx.fillText(`${rival.badge}. ${rival.name}`, rx + 70, ry + 23);
      ctx.fillStyle = PALETTE.ivory;
      ctx.font = '700 11.5px system-ui, sans-serif';
      ctx.fillText(`${rival.title} (${rival.maxHp} HP)`, rx + 70, ry + 43);
      ctx.fillStyle = '#fde68a';
      ctx.font = '700 10px system-ui, sans-serif';
      ctx.fillText(rival.passiveName, rx + 70, ry + 63);
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.fillText(rival.style, rx + 70, ry + 81, 174);
    });

    // Play CTA
    const playHover = this.addButton('start_duel', 465, 608, 350, 56);
    const ctaGrad = ctx.createLinearGradient(465, 608, 465, 664);
    ctaGrad.addColorStop(0, playHover ? '#fbbf24' : '#e0b354');
    ctaGrad.addColorStop(1, playHover ? '#d97706' : '#9a6b1d');
    ctx.fillStyle = ctaGrad;
    this.roundRect(465, 608, 350, 56, 10);
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.fillText('PLAY DUEL  [ENTER]', 640, 637);
  }

  drawEndOverlay(isWin) {
    const ctx = this.ctx;
    const s = this.engine.state;
    ctx.fillStyle = isWin ? 'rgba(8, 16, 18, 0.72)' : 'rgba(20, 7, 10, 0.76)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const accent = isWin ? '#fbbf24' : '#f87171';
    if (isWin) {
      const halo = ctx.createRadialGradient(640, 360, 40, 640, 360, 480);
      halo.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
      halo.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    ctx.fillStyle = 'rgba(11, 18, 26, 0.95)';
    this.roundRect(270, 105, 740, 515, 16);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // High-relief Golden S+ MASTERY Seal on Victory
    if (isWin) {
      const sx = 925;
      const sy = 172;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      for (let i = 0; i < 24; i += 1) {
        const a = (i * Math.PI) / 12;
        const rad = i % 2 === 0 ? 48 : 42;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#92400e';
      ctx.textAlign = 'center';
      ctx.font = '900 24px Georgia, serif';
      ctx.fillText('S+', 0, -2);
      ctx.font = '900 9.5px system-ui, sans-serif';
      ctx.fillText('MASTERY', 0, 17);
      ctx.restore();
    } else {
      this.drawRivalPortrait(s.rival, 925, 168, 36);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = accent;
    ctx.font = '900 42px Georgia, serif';
    ctx.fillText(isWin ? 'VICTORY' : 'DEFEAT', 610, 162);

    ctx.fillStyle = PALETTE.ivory;
    ctx.font = '700 15.5px system-ui, sans-serif';
    ctx.fillText(
      isWin
        ? `${s.rival.name}, ${s.rival.title} Defeated in ${s.turn} Turns`
        : `Ward Shattered by ${s.rival.name} on Turn ${s.turn}`,
      610,
      196
    );

    const stats = [
      ['FINAL SCORE', String(s.score)],
      ['DAMAGE DEALT', String(s.damageDealt)],
      ['DAMAGE BLOCKED', String(s.damageBlocked)],
      ['COMBOS TRIGGERED', String(s.combosTriggered)],
    ];
    stats.forEach(([k, v], idx) => {
      const sy = 224 + idx * 34;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.72)';
      this.roundRect(318, sy, 560, 27, 6);
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.fillText(k, 336, sy + 14);
      ctx.textAlign = 'right';
      ctx.fillStyle = PALETTE.goldBright;
      ctx.font = '900 15px system-ui, sans-serif';
      ctx.fillText(v, 860, sy + 14);
    });

    if (isWin) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde68a';
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.fillText('CHOOSE 1 RELIC BOON FOR NEXT DUEL  [1-3]', 640, 384);

      RELICS.forEach((relic, idx) => {
        const rx = 310 + idx * 224;
        const ry = 400;
        const suit = SUITS[relic.suit] || SUITS.brass;
        const hovered = this.addButton(`pick_relic_${idx}`, rx, ry, 212, 114);
        const isCurrent = this.engine.activeRelic?.id === relic.id;

        ctx.fillStyle = hovered ? '#1e293b' : '#121b26';
        this.roundRect(rx, ry, 212, 114, 10);
        ctx.fill();
        ctx.strokeStyle = hovered ? '#fde047' : isCurrent ? PALETTE.gold : suit.border;
        ctx.lineWidth = hovered || isCurrent ? 2.2 : 1.5;
        ctx.stroke();

        this.drawSuitIcon(relic.suit, rx + 26, ry + 28, 12);
        ctx.textAlign = 'left';
        ctx.fillStyle = PALETTE.goldBright;
        ctx.font = '900 12.5px system-ui, sans-serif';
        ctx.fillText(`[${idx + 1}] ${relic.name}`, rx + 46, ry + 29);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11.5px system-ui, sans-serif';
        ctx.fillText(relic.short, rx + 16, ry + 58, 182);

        ctx.fillStyle = PALETTE.slateText;
        ctx.font = '600 10.5px system-ui, sans-serif';
        ctx.fillText(relic.desc, rx + 16, ry + 84, 182);
      });
    } else {
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.gold;
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillText('DECISIVE RIVAL CARDS:', 320, 390);

      const cardsToShow = [
        { name: 'Ember Cleave', suit: 'ember', tag: 'ENEMY 8' },
        { name: 'Sovereign Wrath', suit: 'ember', tag: 'ENEMY 12' },
        { name: 'Ward Break', suit: 'brass', tag: 'DEFEAT' },
      ];
      cardsToShow.forEach((c, idx) => {
        const cx = 318 + idx * 222;
        const cy = 410;
        const suit = SUITS[c.suit] || SUITS.brass;
        ctx.fillStyle = suit.dark;
        this.roundRect(cx, cy, 206, 62, 8);
        ctx.fill();
        ctx.strokeStyle = suit.border + '99';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        this.drawSuitIcon(c.suit, cx + 22, cy + 31, 11);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 13px system-ui, sans-serif';
        ctx.fillText(c.name, cx + 42, cy + 23);
        ctx.fillStyle = suit.bright;
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.fillText(c.tag, cx + 42, cy + 44);
      });
    }

    const againHover = this.addButton('play_again', 380, 540, 240, 52);
    ctx.fillStyle = againHover ? '#334155' : '#1e293b';
    this.roundRect(380, 540, 240, 52, 9);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.ivory;
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.fillText('REMATCH  [R]', 500, 567);

    const nextHover = this.addButton(isWin ? 'next_rival' : 'back_title', 660, 540, 240, 52);
    ctx.fillStyle = nextHover ? accent : '#d97706';
    this.roundRect(660, 540, 240, 52, 9);
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.fillText(isWin ? 'NEXT RIVAL  [ENTER]' : 'TITLE SCREEN', 780, 567);
  }

  drawRulesModal() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 10, 14, 0.82)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#111a24';
    this.roundRect(240, 110, 800, 500, 14);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '900 24px Georgia, serif';
    ctx.fillText('CATALYSTS & TACTICAL GUIDE', 640, 155);

    const lines = [
      '1. Spend Aether to slot up to 3 cards. Click a slotted card to return it & test orders.',
      '2. Adjacent Catalyst Pairs trigger bonus reactions:',
      '   • Ember + Briar = WILDFIRE (detonates all Burn + Venom + 4 dmg)',
      '   • Ember + Tide  = STEAM BLAST (shatters rival Ward + 5 pierce dmg)',
      '   • Briar + Tide  = LIVING WARD (+4 Heal & +4 Ward)',
      '   • Brass Echo    = GILDED ECHO (re-triggers neighbor slot)',
      '3. Resonance: 2+ cards of the same suit in slots grant bonus suit power.',
      '4. Read Opponent Intent at the top! Counter big strikes with Ward, Chill, or Parry.',
      '5. Right-click any hand card (or press X) once per turn to Cycle (+1 Aether, +1 Card).',
    ];
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.ivory;
    ctx.font = '600 14px system-ui, sans-serif';
    lines.forEach((line, idx) => {
      ctx.fillText(line, 285, 210 + idx * 36);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.fillText('Click anywhere or press [H] to close', 640, 575);
  }

  render(pointer) {
    const ctx = this.ctx;
    this.ui.buttons = [];
    ctx.save();

    if (this.animator.shake > 0.2) {
      const dx = Math.sin(this.animator.clock * 55) * this.animator.shake;
      const dy = Math.cos(this.animator.clock * 48) * this.animator.shake * 0.6;
      ctx.translate(dx, dy);
    }

    if (this.engine.screen === SCREEN_TITLE) {
      this.drawTitleScreen();
    } else {
      const preview = this.engine.previewTurn();
      this.drawTableBackground();
      this.drawTopHud();
      this.drawOpponentRow(preview);
      this.drawCenterArena(preview, pointer);
      this.drawPlayerZone();
      this.drawParticlesAndTexts();

      if (this.engine.screen === SCREEN_WIN) {
        this.drawEndOverlay(true);
      } else if (this.engine.screen === SCREEN_LOSS) {
        this.drawEndOverlay(false);
      }
    }

    if (this.ui.showRules) {
      this.drawRulesModal();
    }

    ctx.restore();
  }
}
