// Spring card motion, flip transitions, particles, floating combat text, and screen shake.

import { SUITS } from './config.js';

export class Animator {
  constructor() {
    this.cardVisuals = new Map();
    this.particles = [];
    this.floatTexts = [];
    this.shake = 0;
    this.clock = 0;
    this.dealQueueTimer = 0;
  }

  reset() {
    this.cardVisuals.clear();
    this.particles.length = 0;
    this.floatTexts.length = 0;
    this.shake = 0;
    this.clock = 0;
  }

  ensureCardVisual(uid, startX, startY, startAngle = 0) {
    if (!this.cardVisuals.has(uid)) {
      this.cardVisuals.set(uid, {
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        angle: startAngle,
        scale: 0.72,
        targetX: startX,
        targetY: startY,
        targetAngle: startAngle,
        targetScale: 1,
        flip: 1,
        targetFlip: 1,
      });
    }
    return this.cardVisuals.get(uid);
  }

  setCardTarget(uid, x, y, angle = 0, scale = 1, snap = false) {
    const vis = this.ensureCardVisual(uid, x, y, angle);
    vis.targetX = x;
    vis.targetY = y;
    vis.targetAngle = angle;
    vis.targetScale = scale;
    if (snap) {
      vis.x = x;
      vis.y = y;
      vis.angle = angle;
      vis.scale = scale;
      vis.vx = 0;
      vis.vy = 0;
    }
  }

  spawnBurst(x, y, suitOrColor, count = 18, speed = 170) {
    const color = SUITS[suitOrColor]?.bright || suitOrColor || '#fce197';
    for (let i = 0; i < count; i += 1) {
      const theta = (Math.PI * 2 * i) / count + ((i % 3) - 1) * 0.2;
      const mag = speed * (0.4 + ((i * 37) % 100) / 140);
      this.particles.push({
        x,
        y,
        vx: Math.cos(theta) * mag,
        vy: Math.sin(theta) * mag - 25,
        life: 0.55 + (i % 5) * 0.1,
        maxLife: 0.95,
        size: 2.5 + (i % 4),
        color,
      });
    }
  }

  spawnVictoryFlourish(width, height) {
    const colors = ['#fde68a', '#f59e0b', '#fca5a5', '#7dd3fc', '#86efac'];
    for (let i = 0; i < 65; i += 1) {
      const px = (width * ((i * 73) % 100)) / 100;
      const py = height * (0.2 + ((i * 29) % 50) / 100);
      this.particles.push({
        x: px,
        y: py,
        vx: (((i % 11) - 5) * 28),
        vy: -60 - (i % 7) * 22,
        life: 1.4 + (i % 4) * 0.25,
        maxLife: 2.2,
        size: 3 + (i % 4),
        color: colors[i % colors.length],
      });
    }
  }

  spawnFloatText(x, y, text, color = '#fce197', scale = 1) {
    this.floatTexts.push({
      x,
      y,
      vy: -48,
      text,
      color,
      scale,
      life: 1.1,
      maxLife: 1.1,
    });
  }

  triggerShake(amount = 8) {
    this.shake = Math.max(this.shake, amount);
  }

  step(dt) {
    this.clock += dt;
    const clampedDt = Math.min(0.05, dt);
    const stiffness = 175;
    const damping = 18;

    for (const vis of this.cardVisuals.values()) {
      const ax = (vis.targetX - vis.x) * stiffness - vis.vx * damping;
      const ay = (vis.targetY - vis.y) * stiffness - vis.vy * damping;
      vis.vx += ax * clampedDt;
      vis.vy += ay * clampedDt;
      vis.x += vis.vx * clampedDt;
      vis.y += vis.vy * clampedDt;
      vis.angle += (vis.targetAngle - vis.angle) * Math.min(1, clampedDt * 14);
      vis.scale += (vis.targetScale - vis.scale) * Math.min(1, clampedDt * 14);
      vis.flip += (vis.targetFlip - vis.flip) * Math.min(1, clampedDt * 12);
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= clampedDt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * clampedDt;
      p.y += p.vy * clampedDt;
      p.vy += 150 * clampedDt;
      p.vx *= 0.98;
    }

    for (let i = this.floatTexts.length - 1; i >= 0; i -= 1) {
      const ft = this.floatTexts[i];
      ft.life -= clampedDt;
      if (ft.life <= 0) {
        this.floatTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * clampedDt;
      ft.vy *= 0.95;
    }

    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - clampedDt * 28);
    }
  }
}
