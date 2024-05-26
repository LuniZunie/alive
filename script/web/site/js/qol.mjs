import genetic_config from './bioscript.mjs';
export {
  Prandom,
};

class Prandom {
  #precision;

  #seed;
  #seedMod;
  #seedMul;

  #i;
  #iMod;
  #iMul;

  constructor(params) {
    let { value: seed, modifier: seedMod, multiplier: seedMul } = params.seed ?? {};
    let { value: i, modifier: iMod, multiplier: iMul } = params.index ?? {};
    let { precision } = params;

    (seed ??= config.prandom.seed), (i ??= 0),
    (seedMod ??= config.prandom.seed_mod), (iMod ??= config.prandom.i_mod),
    (seedMul ??= config.prandom.seed_mul), (iMul ??= config.prandom.i_mul),
    (precision ??= config.prandom.precision);

    if (seed instanceof Prandom) {
      if (params.length == 1)
        return seed;
    }

    this.seed = seed;
    this.seedModifier = seedMod;
    this.seedMultiplier = seedMul;

    this.index = i;
    this.indexModifier = iMod;
    this.indexMultiplier = iMul;

    this.precision = precision;
  }

  get precision() {
    return this.#precision;
  }
  set precision(v) {
    const log10 = Math.log10(v);
    if (typeof v == 'number' && (log10 | 0) == log10)
      return this.#precision = v;
    else
      throw new TypeError('Prandom.prototype.Precision', 0, v);
  }
  Precision(v) {
    const log10 = Math.log10(v);
    if (typeof v == 'number' && (log10 | 0) == log10)
      this.#precision = v;
    else
      throw new TypeError('Prandom.prototype.Precision', 0, v);

    return this;
  }

  get seed() {
    return this.#seed;
  }
  set seed(v) {
    if (typeof v == 'number')
      return this.#seed = v;
    else if (typeof v == 'string')
      return this.#seed = parseInt(v, 36);
    else
      throw new TypeError('Prandom.prototype.Seed', 0, v);
  }
  Seed(v) {
    if (typeof v == 'number')
      this.#seed = v;
    else if (typeof v == 'string')
      this.#seed = parseInt(v, 36);
    else
      throw new TypeError('Prandom.prototype.Seed', 0, v);

    return this;
  }

  get seedModifier() {
    return this.#seedMod;
  }
  set seedModifier(v) {
    if (typeof v == 'number')
      return this.#seedMod = v;
    else
      throw new TypeError('Prandom.prototype.seedModifier', 0, v);
  }
  SeedModifier(v) {
    if (typeof v == 'number')
      this.#seedMod = v;
    else
      throw new TypeError('Prandom.prototype.SeedModifier', 0, v);

    return this;
  }

  get seedMultiplier() {
    return this.#seedMul;
  }
  set seedMultiplier(v) {
    if (typeof v == 'number')
      return this.#seedMul = v;
    else
      throw new TypeError('Prandom.prototype.seedMultiplier', 0, v);
  }
  SeedMultiplier(v) {
    if (typeof v == 'number')
      this.#seedMul = v;
    else
      throw new TypeError('Prandom.prototype.SeedMultiplier', 0, v);

    return this;
  }

  get index() {
    return this.#i;
  }
  set index(v) {
    if (typeof v == 'number')
      return this.#i = v;
    else
      throw new TypeError('Prandom.prototype.index', 0, v);
  }
  Index(v) {
    if (typeof v == 'number')
      this.#i = v;
    else
      throw new TypeError('Prandom.prototype.Index', 0, v);

    return this;
  }

  get indexModifier() {
    return this.#iMod;
  }
  set indexModifier(v) {
    if (typeof v == 'number')
      return this.#iMod = v;
    else
      throw new TypeError('Prandom.prototype.indexModifier', 0, v);
  }
  IndexModifier(v) {
    if (typeof v == 'number')
      this.#iMod = v;
    else
      throw new TypeError('Prandom.prototype.IndexModifier', 0, v);

    return this;
  }

  get indexMultiplier() {
    return this.#iMul;
  }
  set indexMultiplier(v) {
    if (typeof v == 'number')
      return this.#iMul = v;
    else
      throw new TypeError('Prandom.prototype.indexMultiplier', 0, v);
  }
  IndexMultiplier(v) {
    if (typeof v == 'number')
      this.#iMul = v;
    else
      throw new TypeError('Prandom.prototype.IndexMultiplier', 0, v);

    return this;
  }

  get next() {
    const seed = this.#seed * this.#seedMul % this.#seedMod;
    const i = this.#i * this.#iMul % this.#iMod;

    const v = ((seed + i) << this.#i++ % 4.7) % this.#precision;
    const v_sgn = v >> 31;

    return ((v ^ v_sgn) - v_sgn) / this.#precision;
  }

  reset() {
    this.#i = 0;
  }

  deconstruct() {
    this.#seed = undefined;
    this.#seedMod = undefined;
    this.#seedMul = undefined;

    this.#i = undefined;
    this.#iMod = undefined;
    this.#iMul = undefined;

    this.#precision = undefined;
  }

  async *[Symbol.asyncIterator]() {
    while (true)
      yield this.next;
  }

  get [Symbol.isConcatSpreadable]() {
    return false;
  }

  get [Symbol.match]() {
    return false;
  }

  *[Symbol.iterator]() {
    while (true)
      yield this.next;
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return this.next;
      case 'string':
        return this.toString();
      default:
        return this.next;
    }
  }

  get [Symbol.toStringTag]() {
    return 'Prandom';
  }
}
Object.defineProperties(Prandom, {
  next: {
    enumerable: false,
    get: function() {
      return config.prandom.global.next();
    }
  },
  simple: {
    enumerable: false,
    value: function(seed = config.prandom.seed, i = 0) {
      seed = seed * config.prandom.seed_mul % config.prandom.seed_mod;
      i = i * config.prandom.i_mul % config.prandom.i_mod;

      const v = ((seed + i) << i++ % 4.7) % config.prandom.precision;
      const v_sgn = v >> 31;

      return ((v ^ v_sgn) - v_sgn) / config.prandom.precision;
    }
  },
});
