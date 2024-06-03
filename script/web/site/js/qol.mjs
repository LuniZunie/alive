export {
  config,

  Prandom,

  nullish, empty,
  last,

  rng, rngInt, rngW,
  shuffle,

  BUFFER, NOT,
  AND, NAND,
  OR, NOR,
  XOR, XNOR,
  logic,

  buffer, not,
  and, nand,
  or, nor,
  xor, xnor,
  bitwise,
};

const config = {
  prandom: {
    seed: 0,
    seed_mod: 0xFFFFFF2F,
    seed_mul: 0x10001,
    i_mod: 0xFFFFFFA7F,
    i_mul: 0x10001,
    precision: 10e+5,
    global: undefined, // initialized later
  },
  safe_mode: true,
  last_random: undefined,
  last_prandom: undefined,
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
    let { value: seed, modifier: seedMod, multiplier: seedMul } = params?.seed ?? {};
    let { value: i, modifier: iMod, multiplier: iMul } = params?.index ?? {};
    let { precision } = params ?? {};

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

function nullish(v) {
  return v === undefined || v === null;
}

function empty(v) {
  return v === undefined || v === null || v === '';
}

function last(v) {
  if (Array.isArray(v) || typeof v === 'string') return v[v.length - 1];
  else if (typeof v === 'object' && !nullish(v)) return v[Object.keys(v).pop()];
  else return (str => str[str.length - 1])(v.toString?.() ?? '');
}

function rng(min = 0, max) {
  if (Array.isArray(min) || typeof min === 'string') return min[rngInt(0, min.length - 1)];
  else if (typeof min === 'object' && !nullish(min)) return min[Object.keys(min).pop()];
  else if (nullish(max)) return _r * min; // min = max, max = 0
  else return _r * (max - min) + min;
}

function rngInt(min = 0, max, incMin = true, incMax = false) {
  if (nullish(max)) return _r * (min + incMin - incMax) + incMax | 0; // min = max, max = 0
  else return _r * (max - min + incMin - incMax) + min + incMax | 0;
}

function rngW(obj) {
  const r = _r * Object.values(obj)
    .reduce((sum, v) => sum + v);

  let w = 0;
  for (const [ k, v ] of Object.entries(obj))
    if (r < (w += v)) return k;
}

Object.defineProperties(window, {
  _r: {
    configurable: false,
    enumerable: false,
    get: function() {
      config.last_random = Math.random();
      return config.last_random;
    },
  },
  _R: {
    configurable: false,
    enumerable: false,
    get: function() {
      return config.last_random;
    },
  },
  _pr: {
    configurable: false,
    enumerable: false,
    get: function() {
      config.last_prandom = Prandom.next;
      return config.last_prandom;
    },
  },
  _PR: {
    configurable: false,
    enumerable: false,
    get: function() {
      return config.last_prandom;
    },
  },
});

function shuffle(v, prandom) {
  let rtnType = '';
  if (empty(v)) return v;
  else
    switch (typeof v) {
      case 'object': {
        if (!Array.isArray(v))
          v = Object.entries(v),
            rtnType = 'object';

        break;
      } case 'string': {
        v = v.split(''),
          rtnType = 'string';

        break;
      } case 'number':
        case 'bigint': {
        v = v.toString().split(''),
          rtnType = 'number';

        break;
      } case 'boolean':
        case 'function':
        default: return v;
    }

  const gen = prandom instanceof Prandom ?
    () => prandom.next :
    Math.random;

  let i = v.length;
  while (i) {
    const j = gen() * i-- | 0;
    [ v[i], v[j] ] = [ v[j], v[i] ];
  }

  switch (rtnType) {
    case 'object': return Object.fromEntries(v);
    case 'string': return v.join('');
    case 'number': return BigInt(v.join(''));
    default: return v;
  }
}

function BUFFER(v) { // logical BUFFER gate
  if (v === undefined) return undefined;
  else return !!v;
}
function NOT(v) { // logical NOT gate
  if (v === undefined) return undefined;
  else return !v;
}

function AND(...args) { // logical AND gate
  switch (args.length) {
    case 0: return false;
    case 1: return !!args[0];
    case 2: return args[0] && args[1];
    default: return !args.some(v => !v);
  }
}
function NAND(...args) { // logical NAND gate
  switch (args.length) {
    case 0: return true;
    case 1: return !args[0];
    case 2: return !(args[0] && args[1]);
    default: return args.some(v => !v);
  }
}

function OR(...args) { // logical OR gate
  switch (args.length) {
    case 0: return false;
    case 1: return !!args[0];
    case 2: return args[0] || args[1];
    default: return args.some(v => v);
  }
}
function NOR(...args) { // logical NOR gate
  switch (args.length) {
    case 0: return true;
    case 1: return !args[0];
    case 2: return !(args[0] || args[1]);
    default: return !args.some(v => v);
  }
}

function XOR(...args) { // logical XOR gate
  switch (args.length) {
    case 0: return false;
    case 1: return !!args[0];
    case 2: return args[0] != args[1];
    default: return !(args.filter(v => v).length ^ 1);
  }
}
function XNOR(...args) { // logical XNOR gate
  switch (args.length) {
    case 0: return true;
    case 1: return !args[0];
    case 2: return args[0] == args[1];
    default: return !(args.filter(v => v).length & 1);
  }
}

const logic = Object.freeze({
  BUFFER, NOT,
  AND, NAND,
  OR, NOR,
  XOR, XNOR,
});

function buffer(v) { // bitwise BUFFER gate
  return ~~v;
}
function not(v) { // bitwise NOT gate
  return ~v;
}

function and(...args) { // bitwise AND gate
  switch (args.length) {
    case 0: return 0;
    case 1: return args[0];
    case 2: return args[0] & args[1];
    default: return args.reduce((a, b) => a & b);
  }
}
function nand(...args) { // bitwise NAND gate
  switch (args.length) {
    case 0: return ~0;
    case 1: return ~args[0];
    case 2: return ~(args[0] & args[1]);
    default: return ~args.reduce((a, b) => a & b);
  }
}

function or(...args) { // bitwise OR gate
  switch (args.length) {
    case 0: return 0;
    case 1: return args[0];
    case 2: return args[0] | args[1];
    default: return args.reduce((a, b) => a | b);
  }
}
function nor(...args) { // bitwise NOR gate
  switch (args.length) {
    case 0: return ~0;
    case 1: return ~args[0];
    case 2: return ~(args[0] | args[1]);
    default: return ~args.reduce((a, b) => a | b);
  }
}

function xor(...args) { // bitwise XOR gate
  switch (args.length) {
    case 0: return 0;
    case 1: return args[0];
    case 2: return args[0] ^ args[1];
    default: return args.reduce((a, b) => a ^ b);
  }
}
function xnor(...args) { // bitwise XNOR gate
  switch (args.length) {
    case 0: return ~0;
    case 1: return ~args[0];
    case 2: return ~(args[0] ^ args[1]);
    default: return ~args.reduce((a, b) => a ^ b);
  }
}

const bitwise = Object.freeze({
  BUFFER: buffer, NOT: not,
  AND: and, NAND: nand,
  OR: or, NOR: nor,
  XOR: xor, XNOR: xnor,
});