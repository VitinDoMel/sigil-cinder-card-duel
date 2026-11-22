// Pure turn-based card combat engine for Sigil & Cinder: Aether, slots, catalysts, and resolution.

import {
  BASE_AETHER,
  DRAW_PER_TURN,
  MAX_AETHER,
  MAX_CYCLES_PER_TURN,
  MAX_HAND_SIZE,
  MAX_SLOTS,
} from './config.js';
import {
  analyzeBoardSynergies,
  buildPlayerDeck,
  createCardInstance,
  resetCardUidCounter,
} from './cards.js';
import {
  RIVALS,
  buildOpponentDeck,
  planOpponentTurn,
  summarizeOpponentIntent,
} from './opponent.js';
import { SeededRng } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

export class GameEngine {
  constructor(seed = 7) {
    this.seed = seed;
    this.rng = new SeededRng(seed);
    this.rivalIndex = 0;
    this.screen = SCREEN_TITLE;
    this.highScore = 0;
    this.events = [];
    this.state = null;
    this.resetMatch(0, seed, SCREEN_TITLE);
  }

  emit(type, payload = {}) {
    this.events.push({ type, ...payload });
  }

  consumeEvents() {
    const copy = this.events.slice();
    this.events.length = 0;
    return copy;
  }

  resetMatch(rivalIndex = this.rivalIndex, seed = this.seed, startScreen = SCREEN_PLAY) {
    this.rivalIndex = Math.max(0, Math.min(RIVALS.length - 1, rivalIndex));
    this.seed = seed;
    this.rng = new SeededRng(seed);
    resetCardUidCounter();

    const rival = RIVALS[this.rivalIndex];
    const deck = buildPlayerDeck(this.rng);
    const opponentDeck = buildOpponentDeck(rival, this.rng);

    this.screen = startScreen;
    this.state = {
      turn: 1,
      score: 0,
      combosTriggered: 0,
      damageDealt: 0,
      damageBlocked: 0,
      rival,
      player: {
        hp: 30,
        maxHp: 30,
        ward: 0,
        burn: 0,
        venom: 0,
        parry: 0,
        aether: BASE_AETHER,
        maxAether: BASE_AETHER,
        bonusNextAether: 0,
        cyclesLeft: MAX_CYCLES_PER_TURN,
      },
      opponent: {
        hp: rival.maxHp,
        maxHp: rival.maxHp,
        ward: 0,
        burn: 0,
        venom: 0,
        chill: 0,
      },
      deck,
      discard: [],
      hand: [],
      slots: [null, null, null],
      opponentDeck,
      opponentHand: [],
      opponentSlots: [null, null, null],
      selectedCardUid: null,
      lastLog: ['Draw 5 cards. Counter the rival intent!'],
    };

    this.drawCards(DRAW_PER_TURN);
    planOpponentTurn(this.state, this.rng);
    this.emit('match_start', { rivalId: rival.id });
  }

  drawCards(count) {
    const s = this.state;
    let drawn = 0;
    for (let i = 0; i < count; i += 1) {
      if (s.hand.length >= MAX_HAND_SIZE) break;
      if (s.deck.length === 0) {
        if (s.discard.length === 0) break;
        s.deck = this.rng.shuffle(s.discard);
        s.discard = [];
        this.emit('reshuffle');
      }
      const card = s.deck.pop();
      if (card) {
        s.hand.push(card);
        drawn += 1;
        this.emit('card_drawn', { cardUid: card.uid, index: s.hand.length - 1 });
      }
    }
    return drawn;
  }

  canPlayCard(card) {
    if (!card || this.screen !== SCREEN_PLAY) return false;
    return card.cost <= this.state.player.aether;
  }

  selectCard(cardUid) {
    if (this.screen !== SCREEN_PLAY) return false;
    this.state.selectedCardUid = this.state.selectedCardUid === cardUid ? null : cardUid;
    return true;
  }

  playCardToSlot(cardUid, slotIndex) {
    const s = this.state;
    if (this.screen !== SCREEN_PLAY) return false;
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return false;

    const handIndex = s.hand.findIndex((c) => c.uid === cardUid);
    if (handIndex === -1) return false;
    const card = s.hand[handIndex];
    if (card.cost > s.player.aether) {
      this.emit('insufficient_aether', { cardUid });
      return false;
    }

    // If slot is occupied, swap/return existing card back to hand
    const previous = s.slots[slotIndex];
    if (previous) {
      s.player.aether += previous.cost;
      s.hand.push(previous);
    }

    s.hand.splice(handIndex, 1);
    s.player.aether -= card.cost;
    s.slots[slotIndex] = card;
    s.selectedCardUid = null;

    // Immediate gain cards (like +Aether or +Draw) resolve upon resolution, except let's keep preview crisp
    // and let players reorder freely before hitting Resolve!
    this.emit('card_slotted', { card, slotIndex });
    return true;
  }

  playCardToFirstOpenSlot(cardUid) {
    const emptyIdx = this.state.slots.findIndex((c) => c === null);
    if (emptyIdx === -1) return false;
    return this.playCardToSlot(cardUid, emptyIdx);
  }

  unslotCard(slotIndex) {
    const s = this.state;
    if (this.screen !== SCREEN_PLAY) return false;
    const card = s.slots[slotIndex];
    if (!card) return false;
    s.slots[slotIndex] = null;
    s.player.aether += card.cost;
    s.hand.push(card);
    s.selectedCardUid = null;
    this.emit('card_unslotted', { card, slotIndex });
    return true;
  }

  cycleCard(cardUid) {
    const s = this.state;
    if (this.screen !== SCREEN_PLAY || s.player.cyclesLeft <= 0) return false;
    const idx = s.hand.findIndex((c) => c.uid === cardUid);
    if (idx === -1) return false;

    const [removed] = s.hand.splice(idx, 1);
    s.discard.push(removed);
    s.player.cyclesLeft -= 1;
    s.player.aether += 1;
    this.drawCards(1);
    s.selectedCardUid = null;
    s.lastLog.unshift(`Cycled ${removed.name} (+1 Aether, +1 Card).`);
    s.lastLog = s.lastLog.slice(0, 4);
    this.emit('card_cycled', { card: removed });
    return true;
  }

  previewTurn() {
    const s = this.state;
    const synergy = analyzeBoardSynergies(s.slots);
    let totalDmg = 0;
    let totalWard = 0;
    let totalHeal = 0;
    let totalChill = 0;
    let totalParry = 0;
    let totalBurn = 0;
    let totalVenom = 0;
    let totalAether = 0;
    let totalDraw = 0;

    const slotPowerMult = [1, 1, 1];
    for (const cat of synergy.catalysts) {
      if (cat.id === 'gilded_echo') {
        const [a, b] = cat.pair;
        if (s.slots[a] && !s.slots[a].effect.echo) slotPowerMult[a] += 1;
        if (s.slots[b] && !s.slots[b].effect.echo) slotPowerMult[b] += 1;
      }
    }

    for (let i = 0; i < MAX_SLOTS; i += 1) {
      const card = s.slots[i];
      if (!card) continue;
      const mult = slotPowerMult[i];
      const e = card.effect;
      totalDmg += (e.dmg || 0) * mult;
      totalWard += (e.ward || 0) * mult;
      totalHeal += (e.heal || 0) * mult;
      totalChill += (e.chill || 0) * mult;
      totalParry += (e.parry || 0) * mult;
      totalBurn += (e.burn || 0) * mult;
      totalVenom += (e.venom || 0) * mult;
      totalAether += (e.aether || 0) * mult;
      totalDraw += (e.draw || 0) * mult;
    }

    for (const res of synergy.resonances) {
      if (res.suit === 'ember') totalDmg += 3 * (res.count - 1);
      if (res.suit === 'tide') {
        totalWard += 3 * (res.count - 1);
        totalChill += 1 * (res.count - 1);
      }
      if (res.suit === 'briar') {
        totalHeal += 3 * (res.count - 1);
        totalAether += 1;
      }
      if (res.suit === 'brass') {
        totalParry += 4 * (res.count - 1);
        totalDraw += 1;
      }
    }

    for (const cat of synergy.catalysts) {
      if (cat.id === 'wildfire') {
        totalDmg += s.opponent.burn + totalBurn + s.opponent.venom + totalVenom + 4;
      } else if (cat.id === 'steam_blast') {
        totalDmg += 5;
      } else if (cat.id === 'living_ward') {
        totalHeal += 4;
        totalWard += 4;
      }
    }

    const oppIntent = summarizeOpponentIntent(s.opponentSlots, s.opponent.chill + totalChill);
    return {
      synergy,
      totalDmg,
      totalWard,
      totalHeal,
      totalChill,
      totalParry,
      totalBurn,
      totalVenom,
      totalAether,
      totalDraw,
      oppIntent,
    };
  }

  resolveTurn() {
    const s = this.state;
    if (this.screen !== SCREEN_PLAY) return false;

    const preview = this.previewTurn();
    const log = [];

    // 1. Player defense & buffs first
    if (preview.totalWard > 0) {
      s.player.ward += preview.totalWard;
      this.emit('player_ward', { amount: preview.totalWard });
    }
    if (preview.totalHeal > 0) {
      const before = s.player.hp;
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + preview.totalHeal);
      const gained = s.player.hp - before;
      if (gained > 0) this.emit('player_heal', { amount: gained });
    }
    if (preview.totalParry > 0) {
      s.player.parry += preview.totalParry;
    }
    if (preview.totalAether > 0) {
      s.player.bonusNextAether += preview.totalAether;
    }

    // 2. Apply statuses & catalysts to opponent
    s.opponent.chill += preview.totalChill;
    s.opponent.burn += preview.totalBurn;
    s.opponent.venom += preview.totalVenom;

    const hasSteamBlast = preview.synergy.catalysts.some((c) => c.id === 'steam_blast');
    const hasPierce = s.slots.some((c) => c && c.effect.pierce);
    if (hasSteamBlast && s.opponent.ward > 0) {
      s.opponent.ward = 0;
      log.push('Steam Blast shattered rival Ward!');
    }

    // 3. Player attack damage
    let dmg = preview.totalDmg;
    if (dmg > 0) {
      const dealt = this.applyDamage(s.opponent, dmg, hasPierce || hasSteamBlast);
      s.damageDealt += dmg;
      s.score += dmg * 25;
      this.emit('opponent_hit', { amount: dmg, hpDmg: dealt });
    }

    if (preview.synergy.catalysts.length > 0 || preview.synergy.resonances.length > 0) {
      const count = preview.synergy.catalysts.length + preview.synergy.resonances.length;
      s.combosTriggered += count;
      s.score += count * 120;
      for (const cat of preview.synergy.catalysts) {
        log.push(`Catalyst: ${cat.name}!`);
        this.emit('catalyst', { catalyst: cat });
      }
      for (const res of preview.synergy.resonances) {
        log.push(`Resonance: ${res.suit.toUpperCase()} x${res.count}`);
      }
    }

    // Check immediate win before enemy acts
    if (s.opponent.hp <= 0) {
      s.opponent.hp = 0;
      this.finishWin();
      return true;
    }

    // 4. Opponent executes telegraphed slots
    const intent = summarizeOpponentIntent(s.opponentSlots, s.opponent.chill);
    if (intent.ward > 0) {
      s.opponent.ward += intent.ward;
    }
    if (intent.heal > 0) {
      s.opponent.hp = Math.min(s.opponent.maxHp, s.opponent.hp + intent.heal);
    }
    if (intent.burn > 0) s.player.burn += intent.burn;
    if (intent.venom > 0) s.player.venom += intent.venom;

    if (intent.effectiveDmg > 0) {
      const wardBefore = s.player.ward;
      const hpDmg = this.applyDamage(s.player, intent.effectiveDmg, false);
      const blocked = Math.min(wardBefore, intent.effectiveDmg);
      s.damageBlocked += blocked;
      s.score += blocked * 15;
      this.emit('player_hit', { amount: intent.effectiveDmg, hpDmg, blocked });

      if (s.player.parry > 0) {
        const reflect = s.player.parry;
        this.applyDamage(s.opponent, reflect, false);
        s.damageDealt += reflect;
        s.score += reflect * 30;
        log.push(`Parry reflected ${reflect} dmg!`);
        this.emit('parry_reflect', { amount: reflect });
      }
    }

    // 5. Status ticks (Burn & Venom)
    this.tickStatuses(s.opponent, 'opponent');
    this.tickStatuses(s.player, 'player');

    if (s.opponent.hp <= 0) {
      s.opponent.hp = 0;
      this.finishWin();
      return true;
    }
    if (s.player.hp <= 0) {
      s.player.hp = 0;
      this.finishLoss();
      return true;
    }

    // 6. Clean up played slots & advance turn
    for (let i = 0; i < MAX_SLOTS; i += 1) {
      if (s.slots[i]) {
        s.discard.push(s.slots[i]);
        s.slots[i] = null;
      }
    }
    // Keep up to 2 leftover cards in hand, discard rest if hand > 2, or keep all if small
    while (s.hand.length > 3) {
      const discarded = s.hand.shift();
      if (discarded) s.discard.push(discarded);
    }

    s.turn += 1;
    s.player.maxAether = Math.min(MAX_AETHER, BASE_AETHER + Math.floor((s.turn - 1) / 1));
    s.player.aether = Math.min(9, s.player.maxAether + s.player.bonusNextAether);
    s.player.bonusNextAether = 0;
    s.player.parry = 0;
    s.player.cyclesLeft = MAX_CYCLES_PER_TURN;
    s.opponent.chill = 0;
    s.player.ward = Math.floor(s.player.ward * 0.5);
    s.opponent.ward = Math.floor(s.opponent.ward * 0.5);

    const extraDraw = Math.min(3, preview.totalDraw);
    this.drawCards(DRAW_PER_TURN - Math.min(2, s.hand.length) + extraDraw);
    planOpponentTurn(s, this.rng);

    if (log.length === 0) {
      log.push(`Turn ${s.turn}: Counter ${intent.effectiveDmg} incoming dmg.`);
    }
    s.lastLog = log.concat(s.lastLog).slice(0, 4);
    this.emit('turn_advanced', { turn: s.turn });
    return true;
  }

  applyDamage(target, amount, pierce) {
    let remaining = amount;
    if (!pierce && target.ward > 0) {
      const absorbed = Math.min(target.ward, remaining);
      target.ward -= absorbed;
      remaining -= absorbed;
    }
    if (remaining > 0) {
      target.hp = Math.max(0, target.hp - remaining);
    }
    return remaining;
  }

  tickStatuses(target, who) {
    if (target.burn > 0) {
      const burnDmg = target.burn;
      this.applyDamage(target, burnDmg, false);
      target.burn = Math.max(0, target.burn - 1);
      this.emit('status_tick', { who, kind: 'burn', amount: burnDmg });
    }
    if (target.venom > 0) {
      const venomDmg = target.venom;
      target.hp = Math.max(0, target.hp - venomDmg);
      target.venom = Math.max(0, target.venom - 1);
      this.emit('status_tick', { who, kind: 'venom', amount: venomDmg });
    }
  }

  finishWin() {
    const s = this.state;
    const hpBonus = s.player.hp * 35;
    const speedBonus = Math.max(0, 12 - s.turn) * 80;
    s.score += hpBonus + speedBonus + 400;
    this.highScore = Math.max(this.highScore, s.score);
    this.screen = SCREEN_WIN;
    this.emit('victory', { score: s.score });
  }

  finishLoss() {
    this.highScore = Math.max(this.highScore, this.state.score);
    this.screen = SCREEN_LOSS;
    this.emit('defeat', { score: this.state.score });
  }
}

export { createCardInstance };
