// Opponent personas, enemy decks, and telegraphed intent planner so players can read and counter moves.

export const RIVALS = [
  {
    id: 'vespera',
    name: 'Vespera',
    title: 'Copper Alchemist',
    maxHp: 38,
    accent: '#f59e0b',
    badge: 'I',
    style: 'Balanced Strikes & Brass Wards',
    passiveName: 'BRASS HARMONY',
    passiveDesc: '+2 Ward whenever staging Brass',
    banter: {
      open: 'Your aether flickers before my crucible!',
      combo: 'A catalyst spark? Clever — try breaking my copper ward!',
      hurt: 'The alembic cracks... stoke the furnace!',
    },
    deckProfile: [
      { id: 'opp_brass_bolt', name: 'Brass Bolt', suit: 'brass', cost: 1, power: 5, tag: 'STRIKE 5', dmg: 5, ward: 0, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_copper_wall', name: 'Copper Wall', suit: 'brass', cost: 1, power: 5, tag: 'WARD +5', dmg: 0, ward: 5, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_cinder_jet', name: 'Cinder Jet', suit: 'ember', cost: 2, power: 7, tag: 'STRIKE 7', dmg: 7, ward: 0, burn: 2, venom: 0, heal: 0 },
      { id: 'opp_alembic_brew', name: 'Alembic Brew', suit: 'briar', cost: 1, power: 4, tag: 'HEAL +4', dmg: 2, ward: 2, burn: 0, venom: 0, heal: 4 },
      { id: 'opp_furnace_blast', name: 'Furnace Blast', suit: 'ember', cost: 3, power: 9, tag: 'HEAVY 9', dmg: 9, ward: 0, burn: 2, venom: 0, heal: 0 },
      { id: 'opp_steam_vent', name: 'Steam Vent', suit: 'tide', cost: 2, power: 5, tag: 'WARD+DMG', dmg: 4, ward: 4, burn: 0, venom: 0, heal: 0 },
    ],
  },
  {
    id: 'maren',
    name: 'Maren',
    title: 'Tideglass Warden',
    maxHp: 46,
    accent: '#38bdf8',
    badge: 'II',
    style: 'Deep Ward & Venom Attrition',
    passiveName: 'TIDAL EBB',
    passiveDesc: '+2 Venom on unblocked clash',
    banter: {
      open: 'The tideglass reads every card you hold.',
      combo: 'Resonance ripples — yet the abyss answers.',
      hurt: 'My sea-glass cracks... tighten the undertow!',
    },
    deckProfile: [
      { id: 'opp_glass_pike', name: 'Glass Pike', suit: 'tide', cost: 2, power: 6, tag: 'STRIKE 6', dmg: 6, ward: 3, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_reef_bastion', name: 'Reef Bastion', suit: 'tide', cost: 2, power: 8, tag: 'WARD +8', dmg: 0, ward: 8, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_kelp_toxin', name: 'Kelp Toxin', suit: 'briar', cost: 1, power: 4, tag: 'VENOM +3', dmg: 4, ward: 0, burn: 0, venom: 3, heal: 0 },
      { id: 'opp_tide_pulse', name: 'Tide Pulse', suit: 'tide', cost: 2, power: 7, tag: 'STRIKE 7', dmg: 7, ward: 2, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_thorn_veil', name: 'Thorn Veil', suit: 'briar', cost: 2, power: 5, tag: 'HEAL +5', dmg: 3, ward: 4, burn: 0, venom: 0, heal: 5 },
      { id: 'opp_maelstrom', name: 'Maelstrom', suit: 'tide', cost: 3, power: 10, tag: 'HEAVY 10', dmg: 10, ward: 3, burn: 0, venom: 0, heal: 0 },
    ],
  },
  {
    id: 'kaelen',
    name: 'Kaelen',
    title: 'Cinder Sovereign',
    maxHp: 54,
    accent: '#ef4444',
    badge: 'III',
    style: 'Relentless Infernos & Piercing',
    passiveName: 'INFERNO SURGE',
    passiveDesc: '+3 DMG when below 50% HP',
    banter: {
      open: 'Ash and crown — nothing survives my pyre!',
      combo: 'Chain your sigils. My flames burn hotter!',
      hurt: 'Below half blood... feel the Sovereign Surge!',
    },
    deckProfile: [
      { id: 'opp_ember_cleave', name: 'Ember Cleave', suit: 'ember', cost: 2, power: 8, tag: 'STRIKE 8', dmg: 8, ward: 0, burn: 2, venom: 0, heal: 0 },
      { id: 'opp_crown_parry', name: 'Crown Guard', suit: 'brass', cost: 2, power: 6, tag: 'WARD +6', dmg: 3, ward: 6, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_slag_rain', name: 'Slag Rain', suit: 'ember', cost: 2, power: 6, tag: 'BURN +4', dmg: 6, ward: 0, burn: 4, venom: 0, heal: 0 },
      { id: 'opp_sovereign_wrath', name: 'Sovereign Wrath', suit: 'ember', cost: 3, power: 12, tag: 'HEAVY 12', dmg: 12, ward: 0, burn: 3, venom: 0, heal: 0 },
      { id: 'opp_cinder_aegis', name: 'Cinder Aegis', suit: 'brass', cost: 2, power: 7, tag: 'WARD+DMG', dmg: 4, ward: 7, burn: 0, venom: 0, heal: 0 },
      { id: 'opp_ash_bite', name: 'Ash Bite', suit: 'briar', cost: 1, power: 5, tag: 'VENOM +3', dmg: 5, ward: 0, burn: 0, venom: 3, heal: 2 },
    ],
  },
];

let oppCardUid = 10000;

export function buildOpponentDeck(rival, rng) {
  const pool = [];
  for (let copy = 0; copy < 3; copy += 1) {
    for (const template of rival.deckProfile) {
      pool.push({
        uid: oppCardUid++,
        ...template,
      });
    }
  }
  return rng.shuffle(pool);
}

export function planOpponentTurn(state, rng) {
  const rival = state.rival;
  if (state.opponentDeck.length < 5) {
    state.opponentDeck = state.opponentDeck.concat(buildOpponentDeck(rival, rng));
  }

  // Draw 4 cards into opponent's visible top hand
  const hand = [];
  for (let i = 0; i < 4; i += 1) {
    const card = state.opponentDeck.pop();
    if (card) hand.push(card);
  }

  // Choose 2 cards early, up to 3 from turn 3+ (or against Sovereign turn 2+)
  const slotCount = state.turn >= 3 || (rival.id === 'kaelen' && state.turn >= 2) ? 3 : 2;
  const sorted = hand.slice().sort((a, b) => {
    const scoreA = a.dmg + a.ward * 0.7 + a.burn * 1.1 + a.venom;
    const scoreB = b.dmg + b.ward * 0.7 + b.burn * 1.1 + b.venom;
    return scoreB - scoreA;
  });

  const intentSlots = [null, null, null];
  const hiddenHand = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i < slotCount) {
      intentSlots[i] = sorted[i];
    } else {
      hiddenHand.push(sorted[i]);
    }
  }

  // Also show 4 cards in top arched opponent hand (some hidden face-down, some revealed)
  state.opponentHand = hiddenHand.map((c) => ({ ...c, faceUp: false }));
  // Keep at least 3 cards visually in opponent's top hand so the hand silhouette stays rich
  while (state.opponentHand.length < 3 && state.opponentDeck.length > 0) {
    const extra = state.opponentDeck.pop();
    if (extra) state.opponentHand.push({ ...extra, faceUp: false });
  }
  state.opponentSlots = intentSlots;
}

export function summarizeOpponentIntent(opponentSlots, chillAmount = 0) {
  let rawDmg = 0;
  let ward = 0;
  let burn = 0;
  let venom = 0;
  let heal = 0;

  for (const card of opponentSlots) {
    if (!card) continue;
    rawDmg += card.dmg;
    ward += card.ward;
    burn += card.burn;
    venom += card.venom;
    heal += card.heal;
  }

  const effectiveDmg = Math.max(0, rawDmg - chillAmount);
  return { rawDmg, effectiveDmg, ward, burn, venom, heal };
}
