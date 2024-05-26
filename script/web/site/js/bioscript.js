import { Prandom } from './qol.mjs';

import codonsTemp from '/assets/data/json/base_codon.json' with { type: 'json' };
codonsTemp = (function(obj) {
  function objHandler(obj) {
    return Object.fromEntries(
      Object.entries(obj).map(([ k, v ]) => [ k, propHandler(v) ])
    );
  }

  function arrayHandler(arr) {
    return arr.map(propHandler);
  }

  function propHandler(prop) {
    if (prop === undefined || prop === null) return;
    else if (Array.isArray(prop)) return arrayHandler(prop);
    else if (typeof prop === 'object') return objHandler(prop);
    else if (typeof prop === 'string')
      switch (prop[0]) {
        case 'S': return prop.slice(1);
        case 'N': return parseInt(prop.slice(1), 36);
        case 'n': return parseFloat(prop.slice(1));
        case 'B': return BigInt(parseInt(prop.slice(1), 36));
        default: return prop;
      }
    else if (typeof prop === 'number') return !!prop;
    else return prop;
  }

  return objHandler(obj);
})(codonsTemp);

const genetic_config = (function(obj) {
  Object.entries(codonsTemp).forEach(function([ codon, data ]) {
    obj.codon.list.all.push(codon);
    if (data.start) {
      obj.codon.list.start.push(codon);
      obj.codon.dictionary.function = 'start';
    } else if (data.stop) {
      obj.codon.list.stop.push(codon);
      obj.codon.dictionary.function = 'stop';
    } else obj.codon.list.normal.push(codon);

    obj.codon.list.all.push(codon);
    obj.codon.dictionary.object[codon] = data;
  });
})({
  nucleotides: {
    numbers: {
      min: 1,
      max: 8,
      list: [ 1, 2, 3, 4, 5, 6, 7, 8 ],
    },
    characters: { // asked for 8 random letters from friend from high school with initials P.G.
      min: 'a',
      max: 'm',
      list: [ 'a', 'c', 'y', 'l', 'p', 'd', 'f', 'm' ],
    }
  },
  nucleotidesReference: {
    1: 'a', 2: 'c', 3: 'y', 4: 'l',
    5: 'p', 6: 'd', 7: 'f', 8: 'm',

    a: 1, c: 2, y: 3, l: 4,
    p: 5, d: 6, f: 7, m: 8,
  },
  codon: {
    length: 4, // 4096 possible codons (8^4)
    total: 4096,
    dictionary: {
      function: {},
      object: {}
    },
    list: {
      start: [],
      stop: [],
      normal: [],
      all: [],
    }
  }
});

class DNA {
  #genes;

  constructor(...parents) {
    if (parents.length === 1 && typeof parents[0] === 'number')
      this.#genes = genetic_config.nucleotides.list.map(() => genetic_config.nucleotides.list[Prandom.simple(genetic_config.nucleotides)]);
  }
}
Object.defineProperties(DNA, {
  convert: { // single directional conversion
    enumerable: false,
    writable: false,
    configurable: false,
    value: v => geneticLetters[v],
  },
  mdConvert: { // multi directional conversion
    enumerable: false,
    writable: false,
    configurable: false,
    value: v => geneticLetters[v],
  },
});

export default genetic_config;
export { DNA };
