import * as qol_temp from './qol.mjs';
Object.assign(window, qol_temp);
qol_temp = undefined;

import _INTERNAL__temp from './internal.mjs';
import { execCheck } from './internal.mjs';

export {
  Prandom,
  language_syntax
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
};

const _INTERNAL_ = Object.fromEntries(
  Object.entries(
    _INTERNAL__temp
  ).map(
    ([ k, v ]) => [ k, (config.safe_mode ? v?.safe : v?.unsafe) ?? v ]
  )
);
Object.freeze(_INTERNAL_);

const language_syntax = Object.fromEntries(
  Object.entries(
    {
      data_types: {
        //# BigInts
        BigInt: {
          safe: function(v, opts) {
            const check = v => (v | 0) === v; // type check (('5'| 0) !== 5), int check ((5.5 | 0) !== 5.5), finite check ((NaN | 0) !== NaN)

            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (typeof v !== 'number')
              throw new TypeError('Value must be a number');
            else if (values instanceof Array)
              return BigInt(execCheck(_INTERNAL_.parseOpts(v, values), check));
            else if (values !== undefined)
              throw new TypeError('Value options must be an array');
            else if (typeof min !== 'number' || typeof max !== 'number')
              throw new TypeError('Min and max must be numbers');
            else if (min > max)
              throw new TypeError('Min must be less than or equal to max');

            v |= 0; // Truncate to integer

            const mod = max - min + 1;
            if (v < min) return BigInt(execCheck(max - (min - v - 1) % mod, check)); // Wrap around
            else if (v > max) return BigInt(execCheck(min + (v - max - 1) % mod, check)); // Wrap around
            else return BigInt(execCheck(v, check)); // No wrap around
          },
          unsafe: function(v, opts) {
            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (values instanceof Array)
              return _INTERNAL_.parseOpts(v, values);

            const mod = max - min + 1;
            if (v < min) return BigInt(max - (min - v - 1) % mod); // Wrap around
            else if (v > max) return BigInt(min + (v - max - 1) % mod); // Wrap around
            else return BigInt(v); // No wrap around
          },
        },

        //# Booleans
        Boolean: {
          safe: function(v, opts) {
            const check = v => typeof v === 'boolean'; // type check (!Number.isFinite('5'))

            const values = opts?.list;
            if (typeof v !== 'boolean')
              throw new TypeError('Value must be a boolean');
            else if (values instanceof Array)
              return execCheck(_INTERNAL_.parseOpts(v, values), check);
            else if (values !== undefined)
              throw new TypeError('Value options must be an array');

            return execCheck(!((v | 0) % 2), check);
          },
          unsafe: function(v, opts) {
            const values = opts?.list;
            if (values instanceof Array)
              return _INTERNAL_.parseOpts(v, values);
            else return !(v | 0) % 2;
          },
        },

        //# Numbers
        Integer: {
          safe: function(v, opts) {
            const check = v => (v | 0) === v; // type check (('5'| 0) !== 5), int check ((5.5 | 0) !== 5.5), finite check ((NaN | 0) !== NaN)

            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (typeof v !== 'number')
              throw new TypeError('Value must be a number');
            else if (values instanceof Array)
              return execCheck(_INTERNAL_.parseOpts(v, values), check);
            else if (values !== undefined)
              throw new TypeError('Value options must be an array');
            else if (typeof min !== 'number' || typeof max !== 'number')
              throw new TypeError('Min and max must be numbers');
            else if (min > max)
              throw new TypeError('Min must be less than or equal to max');

            v |= 0; // Truncate to integer

            const mod = max - min + 1;
            if (v < min) return execCheck(max - (min - v - 1) % mod, check); // Wrap around
            else if (v > max) return execCheck(min + (v - max - 1) % mod, check); // Wrap around
            else return execCheck(v, check); // No wrap around
          },
          unsafe: function(v, opts) {
            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (values instanceof Array)
              return _INTERNAL_.parseOpts(v, values);

            const mod = max - min + 1;
            if (v < min) return max - (min - v - 1) % mod; // Wrap around
            else if (v > max) return min + (v - max - 1) % mod; // Wrap around
            else return v; // No wrap around
          },
        },
        Float: {
          safe: function(v, opts) {
            const check = v => Number.isFinite(v); // type check (!Number.isFinite('5')), finite check (!Number.isFinite(Infinity))

            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (typeof v !== 'number')
              throw new TypeError('Value must be a number');
            else if (values instanceof Array)
              return execCheck(_INTERNAL_.parseOpts(v, values), check);
            else if (values !== undefined)
              throw new TypeError('Value options must be an array');
            else if (typeof min !== 'number' || typeof max !== 'number')
              throw new TypeError('Min and max must be numbers');
            else if (min > max)
              throw new TypeError('Min must be less than or equal to max');

            const mod = max - min + 1;
            if (v < min) return execCheck(max - (min - v - 1) % mod, check); // Wrap around
            else if (v > max) return execCheck(min + (v - max - 1) % mod, check); // Wrap around
            else return execCheck(v, check); // No wrap around
          },
          unsafe: function(v, opts) {
            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (values instanceof Array)
              return _INTERNAL_.parseOpts(v, values);

            const mod = max - min + 1;
            if (v < min) return max - (min - v - 1) % mod; // Wrap around
            else if (v > max) return min + (v - max - 1) % mod; // Wrap around
            else return v; // No wrap around
          },
        },
        Number: {
          safe: function(v, opts) {
            const check = v => typeof v === 'number'; // type check (!Number.isFinite('5'))

            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (typeof v !== 'number')
              throw new TypeError('Value must be a number');
            else if (values instanceof Array)
              return execCheck(_INTERNAL_.parseOpts(v, values), check);
            else if (values !== undefined)
              throw new TypeError('Value options must be an array');
            else if (typeof min !== 'number' || typeof max !== 'number')
              throw new TypeError('Min and max must be numbers');
            else if (min > max)
              throw new TypeError('Min must be less than or equal to max');

            const mod = max - min + 1;
            if (v < min) return execCheck(max - (min - v - 1) % mod, check); // Wrap around
            else if (v > max) return execCheck(min + (v - max - 1) % mod, check); // Wrap around
            else return execCheck(v, check); // No wrap around
          },
          unsafe: function(v, opts) {
            const values = opts?.list,
              min = opts?.min ?? -Infinity, max = opts?.max ?? Infinity;

            if (values instanceof Array)
              return _INTERNAL_.parseOpts(v, values);

            const mod = max - min + 1;
            if (v < min) return max - (min - v - 1) % mod; // Wrap around
            else if (v > max) return min + (v - max - 1) % mod; // Wrap around
            else return v; // No wrap around
          },
        },

        //# Strings
        String: {
          safe: function(v, opts) {
            const check = v => typeof v === 'string'; // type check (!Number.isFinite('5'))

            const values = opts?.list;
            if (typeof v !== 'string')
              throw new TypeError('Value must be a string');
            else if (values instanceof Array)
              return execCheck(_INTERNAL_.parseOpts(v, values), check);
            else if (values !== undefined)
              throw new TypeError('Value options must be an array');

            return execCheck(v, check);
          },
          unsafe: function(v, opts) {
            const values = opts?.list;
            if (values instanceof Array)
              return _INTERNAL_.parseOpts(v, values);
            else return v;
          },
        },

        //# Undefined
        Undefined: () => undefined,

        //# Null
        Null: () => null,
      }
    }
  ).map(
    ([ k, v ]) => [ k, (config.safe_mode ? v?.safe : v?.unsafe) ?? v ]
  )
);
Object.freeze(language_syntax);

config.prandom.global = new Prandom();