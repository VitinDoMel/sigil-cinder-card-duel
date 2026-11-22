// Original card catalog, player deck builder, and synergy/catalyst evaluation for Sigil & Cinder.

export const CARD_CATALOG = {
  cinder_spark: {
    id: 'cinder_spark',
    name: 'Cinder Spark',
    suit: 'ember',
    cost: 1,
    power: 5,
    tag: 'DMG 5',
    art: 'spark',
    desc: 'Deal 5 damage.',
    effect: { dmg: 5 },
  },
  hearth_flare: {
    id: 'hearth_flare',
    name: 'Hearth Flare',
    suit: 'ember',
    cost: 1,
    power: 3,
    tag: 'BURN +3',
    art: 'flare',
    desc: 'Deal 3 dmg, apply 3 Burn.',
    effect: { dmg: 3, burn: 3 },
  },
  molten_lance: {
    id: 'molten_lance',
    name: 'Molten Lance',
    suit: 'ember',
    cost: 2,
    power: 8,
    tag: 'PIERCE 8',
    art: 'lance',
    desc: 'Deal 8 piercing dmg.',
    effect: { dmg: 8, pierce: true },
  },
  ash_crescendo: {
    id: 'ash_crescendo',
    name: 'Ash Crescendo',
    suit: 'ember',
    cost: 2,
    power: 5,
    tag: 'BURN +4',
    art: 'cinder',
    desc: 'Deal 5 dmg, apply 4 Burn.',
    effect: { dmg: 5, burn: 4 },
  },
  pyre_nova: {
    id: 'pyre_nova',
    name: 'Pyre Nova',
    suit: 'ember',
    cost: 3,
    power: 12,
    tag: 'DMG 12',
    art: 'nova',
    desc: 'Deal 12 dmg, apply 2 Burn.',
    effect: { dmg: 12, burn: 2 },
  },

  mist_veil: {
    id: 'mist_veil',
    name: 'Mist Veil',
    suit: 'tide',
    cost: 1,
    power: 5,
    tag: 'WARD +5',
    art: 'veil',
    desc: 'Gain 5 Ward.',
    effect: { ward: 5 },
  },
  undertow: {
    id: 'undertow',
    name: 'Undertow',
    suit: 'tide',
    cost: 1,
    power: 4,
    tag: 'CHILL -4',
    art: 'wave',
    desc: 'Deal 3 dmg, Chill enemy -4.',
    effect: { dmg: 3, chill: 4 },
  },
  tidal_tome: {
    id: 'tidal_tome',
    name: 'Tidal Tome',
    suit: 'tide',
    cost: 2,
    power: 5,
    tag: 'DRAW +2',
    art: 'tome',
    desc: 'Gain 5 Ward, draw 2 cards.',
    effect: { ward: 5, draw: 2 },
  },
  glacial_snare: {
    id: 'glacial_snare',
    name: 'Glacial Snare',
    suit: 'tide',
    cost: 2,
    power: 7,
    tag: 'CHILL -7',
    art: 'snare',
    desc: 'Gain 4 Ward, Chill enemy -7.',
    effect: { ward: 4, chill: 7 },
  },
  abyssal_surge: {
    id: 'abyssal_surge',
    name: 'Abyssal Surge',
    suit: 'tide',
    cost: 3,
    power: 10,
    tag: 'WARD +10',
    art: 'surge',
    desc: 'Gain 10 Ward, deal 4 dmg.',
    effect: { ward: 10, dmg: 4, draw: 1 },
  },

  sap_bloom: {
    id: 'sap_bloom',
    name: 'Sap Bloom',
    suit: 'briar',
    cost: 0,
    power: 2,
    tag: 'AETHER +2',
    art: 'bloom',
    desc: 'Gain +2 Aether & +2 HP.',
    effect: { aether: 2, heal: 2 },
  },
  thorn_lash: {
    id: 'thorn_lash',
    name: 'Thorn Lash',
    suit: 'briar',
    cost: 1,
    power: 4,
    tag: 'VENOM +3',
    art: 'thorn',
    desc: 'Deal 4 dmg, apply 3 Venom.',
    effect: { dmg: 4, venom: 3 },
  },
  moss_mend: {
    id: 'moss_mend',
    name: 'Moss Mend',
    suit: 'briar',
    cost: 1,
    power: 6,
    tag: 'HEAL +6',
    art: 'moss',
    desc: 'Heal 6 HP, gain 2 Ward.',
    effect: { heal: 6, ward: 2 },
  },
  root_snare: {
    id: 'root_snare',
    name: 'Root Snare',
    suit: 'briar',
    cost: 2,
    power: 5,
    tag: 'VENOM +5',
    art: 'roots',
    desc: 'Deal 5 dmg, 5 Venom, +1 Aether.',
    effect: { dmg: 5, venom: 5, aether: 1 },
  },
  vernal_crown: {
    id: 'vernal_crown',
    name: 'Vernal Crown',
    suit: 'briar',
    cost: 3,
    power: 8,
    tag: 'HEAL +8',
    art: 'crown',
    desc: 'Heal 8 HP, deal 6 dmg.',
    effect: { heal: 8, dmg: 6, aether: 1 },
  },

  pendulum_ward: {
    id: 'pendulum_ward',
    name: 'Pendulum Ward',
    suit: 'brass',
    cost: 1,
    power: 6,
    tag: 'PARRY 6',
    art: 'pendulum',
    desc: '4 Ward, reflect 6 dmg.',
    effect: { ward: 4, parry: 6 },
  },
  gilded_lens: {
    id: 'gilded_lens',
    name: 'Gilded Lens',
    suit: 'brass',
    cost: 1,
    power: 3,
    tag: 'DRAW +2',
    art: 'lens',
    desc: 'Draw 2 cards, +1 Aether.',
    effect: { draw: 2, aether: 1 },
  },
  clockwork_echo: {
    id: 'clockwork_echo',
    name: 'Clockwork Echo',
    suit: 'brass',
    cost: 2,
    power: 4,
    tag: 'ECHO x2',
    art: 'echo',
    desc: 'Re-trigger adjacent slot + 3 dmg.',
    effect: { echo: true, dmg: 3 },
  },
  aegis_mirror: {
    id: 'aegis_mirror',
    name: 'Aegis Mirror',
    suit: 'brass',
    cost: 2,
    power: 9,
    tag: 'PARRY 9',
    art: 'mirror',
    desc: '6 Ward, reflect 9 dmg.',
    effect: { ward: 6, parry: 9 },
  },
  chronos_seal: {
    id: 'chronos_seal',
    name: 'Chronos Seal',
    suit: 'brass',
    cost: 3,
    power: 7,
    tag: 'ECHO + 7',
    art: 'seal',
    desc: 'Deal 7 dmg, 5 Ward, Echo.',
    effect: { dmg: 7, ward: 5, echo: true },
  },
};

export const CATALYST_RECIPES = [
  {
    suits: ['ember', 'briar'],
    id: 'wildfire',
    name: 'Wildfire',
    color: '#fb923c',
    summary: 'Detonates Burn + Venom (+4 dmg)',
  },
  {
    suits: ['ember', 'tide'],
    id: 'steam_blast',
    name: 'Steam Blast',
    color: '#e879f9',
    summary: 'Shatters Ward +5 pierce dmg',
  },
  {
    suits: ['briar', 'tide'],
    id: 'living_ward',
    name: 'Living Ward',
    color: '#34d399',
    summary: '+4 Heal & +4 Ward',
  },
];

let nextUid = 1;

export function createCardInstance(cardId) {
  const template = CARD_CATALOG[cardId];
  if (!template) {
    throw new Error(`Unknown card id: ${cardId}`);
  }
  return {
    uid: nextUid++,
    ...template,
    effect: { ...template.effect },
  };
}

export function resetCardUidCounter() {
  nextUid = 1;
}

export function buildPlayerDeck(rng) {
  const starterIds = [
    'cinder_spark', 'cinder_spark', 'hearth_flare', 'molten_lance', 'ash_crescendo', 'pyre_nova',
    'mist_veil', 'undertow', 'undertow', 'tidal_tome', 'glacial_snare', 'abyssal_surge',
    'sap_bloom', 'sap_bloom', 'thorn_lash', 'moss_mend', 'root_snare', 'vernal_crown',
    'pendulum_ward', 'gilded_lens', 'clockwork_echo', 'aegis_mirror', 'chronos_seal',
  ];
  const instances = starterIds.map((id) => createCardInstance(id));
  return rng.shuffle(instances);
}

export function analyzeBoardSynergies(slots) {
  const catalysts = [];
  const resonances = [];
  const suitCounts = { ember: 0, tide: 0, briar: 0, brass: 0 };

  for (const card of slots) {
    if (card) suitCounts[card.suit] += 1;
  }

  for (const [suit, count] of Object.entries(suitCounts)) {
    if (count >= 2) {
      resonances.push({ suit, count });
    }
  }

  for (let i = 0; i < slots.length - 1; i += 1) {
    const left = slots[i];
    const right = slots[i + 1];
    if (!left || !right) continue;

    if (left.suit === 'brass' || right.suit === 'brass') {
      if (left.effect.echo || right.effect.echo) {
        catalysts.push({
          id: 'gilded_echo',
          name: 'Gilded Echo',
          color: '#fbbf24',
          pair: [i, i + 1],
          summary: 'Re-triggers neighbor slot',
        });
      }
    }

    for (const recipe of CATALYST_RECIPES) {
      const matches =
        (left.suit === recipe.suits[0] && right.suit === recipe.suits[1]) ||
        (left.suit === recipe.suits[1] && right.suit === recipe.suits[0]);
      if (matches) {
        catalysts.push({
          id: recipe.id,
          name: recipe.name,
          color: recipe.color,
          pair: [i, i + 1],
          summary: recipe.summary,
        });
      }
    }
  }

  return { catalysts, resonances, suitCounts };
}
