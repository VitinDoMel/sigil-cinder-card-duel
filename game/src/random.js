// Deterministic seeded PRNG (Mulberry32) for reproducible deals, AI draws, and screenshots.

export class SeededRng {
  constructor(seed = 1) {
    this.state = (Number(seed) || 1) >>> 0;
  }

  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min, maxInclusive) {
    return Math.floor(this.next() * (maxInclusive - min + 1)) + min;
  }

  pick(items) {
    if (!items.length) return undefined;
    return items[Math.floor(this.next() * items.length)];
  }

  shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }
}
