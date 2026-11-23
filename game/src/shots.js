// Deterministic screenshot stage setup (?shot=play|title|win|loss&seed=7) driving real engine turns.

import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './engine.js';

function playSmartTurn(engine, targetSelfLoss = false) {
  const s = engine.state;
  if (targetSelfLoss) {
    // Pass without slotting defense so rival's attacks defeat the player naturally
    engine.resolveTurn();
    return;
  }

  // Pick high-synergy playable cards from hand into slots 0..2
  let guard = 0;
  while (s.slots.some((slot) => slot === null) && guard < 6) {
    guard += 1;
    const playable = s.hand
      .filter((c) => c.cost <= s.player.aether)
      .sort((a, b) => b.power + (b.effect.echo ? 3 : 0) - (a.power + (a.effect.echo ? 3 : 0)));
    if (playable.length === 0) break;
    if (!engine.playCardToFirstOpenSlot(playable[0].uid)) break;
  }
  engine.resolveTurn();
}

export function stageShotScene(shotName, engine, animator) {
  animator.reset();

  if (shotName === 'title') {
    engine.resetMatch(0, engine.seed, SCREEN_TITLE);
    return;
  }

  if (shotName === 'play') {
    engine.resetMatch(0, 11, SCREEN_PLAY);
    // Play 1 real turn so rival HP, player HP, score, and discard pile are authentic mid-duel
    playSmartTurn(engine, false);

    const s = engine.state;
    // Ensure lethal climax is highlighted when pairing slotted cards in APEX + Catalyst
    if (s.opponent.hp > 16) s.opponent.hp = 16;
    s.rivalBanter = s.rival.banter?.combo || 'A catalyst spark? Clever — try breaking my ward!';

    // Stage 2 complementary cards in slots 0 and 1 (APEX +2) to show active Catalyst + LETHAL
    const slotCandidates = s.hand.filter((c) => c.cost <= s.player.aether);
    const first =
      slotCandidates.find((c) => c.suit === 'ember') ||
      slotCandidates.find((c) => c.suit === 'briar') ||
      slotCandidates[0];
    if (first) engine.playCardToSlot(first.uid, 0);

    const remainingPlayable = s.hand.filter((c) => c.cost <= s.player.aether);
    const second =
      remainingPlayable.find((c) => first && c.suit !== first.suit) || remainingPlayable[0];
    if (second) engine.playCardToSlot(second.uid, 1);

    if (s.hand.length > 1) {
      s.selectedCardUid = s.hand[Math.floor(s.hand.length / 2)].uid;
    }

    animator.spawnFloatText(875, 48, '-11', '#fb7185', 1.35);
    animator.spawnBurst(515, 330, 'ember', 24, 135);
    return;
  }

  if (shotName === 'win') {
    engine.resetMatch(0, engine.seed, SCREEN_PLAY);
    for (let t = 0; t < 18 && engine.screen === SCREEN_PLAY; t += 1) {
      // Prioritize a ward card early if available so Damage Blocked is showcased too
      if (t === 0) {
        const wardCard = engine.state.hand.find((c) => (c.effect.ward || 0) > 0 && c.cost <= engine.state.player.aether);
        if (wardCard) engine.playCardToFirstOpenSlot(wardCard.uid);
      }
      playSmartTurn(engine, false);
    }
    if (engine.screen !== SCREEN_WIN) {
      engine.state.opponent.hp = 0;
      engine.finishWin();
    }
    animator.spawnVictoryFlourish(1280, 720);
    return;
  }

  if (shotName === 'loss') {
    engine.resetMatch(2, engine.seed, SCREEN_PLAY);
    // Fight 1 real turn so score/damage/combos are genuine, then get overwhelmed by Kaelen
    playSmartTurn(engine, false);
    for (let t = 0; t < 20 && engine.screen === SCREEN_PLAY; t += 1) {
      playSmartTurn(engine, true);
    }
    if (engine.screen !== SCREEN_LOSS) {
      engine.state.player.hp = 0;
      engine.finishLoss();
    }
    animator.spawnBurst(200, 520, 'ember', 24, 160);
  }
}
