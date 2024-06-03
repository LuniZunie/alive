import * as qolExports from './qol.mjs';
for (const [ k, v ] of Object.entries(qolExports))
  globalThis[k] = v;

import codonsExport from '/assets/data/json/base_codon.json' with { type: 'json' };
const codonsTemp = (function(obj) {
  function objHandler(obj) {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([ k, v ]) => [ k, propHandler(v) ])
    );
  }

  function arrayHandler(arr) {
    return arr.map(propHandler);
  }

  function propHandler(prop) {
    if (nullish(prop)) return;
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
})(codonsExport);

const genetic_config = (function(obj) {
  Object.entries(codonsTemp)
    .forEach(function([ codon, data ]) {
      obj.codon.list.all.push(codon);
      if (data.start) {
        obj.codon.list.start.push(codon);
        obj.codon.dictionary.function = 'start';
      } else if (data.stop) {
        obj.codon.list.stop.push(codon);
        obj.codon.dictionary.function = 'stop';
      } else obj.codon.list.normal.push(codon);

      obj.codon.list.all.push(codon);
      obj.codon.dictionary.details[codon] = data;
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
      details: {}
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

/**
 * \operator\ or \human_operator;computer_operator\
 */

const Algebra = {
  config: {
    length: {
      target: 5,
      cap: 20,
    },
    operators: [
      ' + ;+', ' - ;-',
      ' \xd7 ;*', ' \xf7 ;/', ' \u{1d45a}\u{1d45c}\u{1d451} ;%', //. mult. sign, div. sign, "mod"
    ],
    enclosers: {
      parenthesis: {
        open: [ '(', '-(' ],
        close: ')',
        chance: 0.25
      },
      pipe: {
        open: '|;Math.abs(',
        close: '|;)',
        chance: 0.1
      },
    },
    numbers: {
      weights: {
        float: 0.4,
        int: 0.6,
      },
      range: {
        min: -1000,
        max: 1000,
      },
    },
  },
  generate: function() {
    const { raw: eq1, human: eq1_h, computer: eq1_c } = Algebra.generateSide(_r < 0.5);
    const { raw: eq2, human: eq2_h, computer: eq2_c } = Algebra.generateSide(_R >= 0.5);

    return {
      raw: eq1 + '` = ;=`' + eq2,
      human: eq1_h + ' = ' + eq2_h,
      computer: eq1_c + '=' + eq2_c
    };
  },
  generateSide: function(incVar = 0, replaceTemp = 1) {
    const encCache = [];
    let eq = genTempNum(),
      nums = 1;

    function getSym(v) {
      if (Array.isArray(v)) v = rng(v);
      else if (typeof v === 'object' && !nullish(v)) v = rngW(v);

      return '`' + v + '`';
    }

    function genTempNum() {
      let enc_s = [], enc_e = []; // start & end enclosers

      const encs = shuffle(Object.entries(Algebra.config.enclosers));
      for (const [ enc, dat ] of encs) {
        const r_op = _r < dat.chance,
          r_cl = _r < dat.chance;

        const op = getSym(dat.open),
          cl = getSym(dat.close);

        if (r_op && r_cl) enc_s.push(op), enc_e.unshift(cl);
        else if (r_op) {
          enc_s.push(op);
          encCache.push(enc);
        } else if (r_cl && last(encCache) === enc) {
          enc_e.unshift(cl);
          encCache.pop();
        }
      }

      return enc_s.join('') + 'TEMP_NUM' + enc_e.join('');
    }

    function genOp() {
      return `\`${rng(Algebra.config.operators)}\``;
    }

    function genNums(str) {
      const varI = incVar ? rngInt(nums) : -1;

      let i = 0;
      const { min, max } = Algebra.config.numbers.range;
      return str.replaceAll('TEMP_NUM', function() {
        if (varI === i++) return 'x';

        switch (rngW(Algebra.config.numbers.weights)) {
          case 'float': return rng(min, max);
          case 'int': return rngInt(min, max);
        }
      })
    }

    function formatEq(str, comp) {
      str = str.replace(/`.*?`/g, function(v, ...args) {
        v = v.slice(1, -1);
        if (v.includes(';')) return v.split(';')[+comp];
        else return v;
      });

      if (comp) return str.replaceAll('+-', '-').replaceAll('--', '+');
      else return str.replaceAll('+ -', '- ').replaceAll('- -', '+ ');
    }

    for (; rngInt(Algebra.config.length.cap) && nums++ <= Algebra.config.length.target;)
      eq += genOp() + genTempNum();

    for (const enc of encCache.reverse())
      eq += getSym(Algebra.config.enclosers[enc].close);

    if (replaceTemp) eq = genNums(eq);

    return {
      raw: eq,
      human: formatEq(eq, false),
      computer: formatEq(eq, true),
    }
  },
  solve: function(eq) { // computer equation
    // Split into precedence groups
    let dummyEq = eq,
      groups = [];

    while (dummyEq.includes('(') || dummyEq.includes(')') || dummyEq.includes('|'))
      dummyEq = dummyEq.replace(/[\(|][^\(|]*?[\)|]/g, function(v) {
        groups.push(v);
        return '`' + (groups.length - 1) + '`';
      });

    groups.push(`(${dummyEq})`);

    // Further split into precedence groups
    let temp = [];
    for (const group of groups) {
      const enc_s = group[0],
        enc_e = last(group);

      group = group.slice(1, -1);

    }

    console.log(groups);
    return eq;
  }
};

class Reward {
  #config = {
    bonus: {
      max: 2.5,
      min: 0.5,
    }
  };

  #question = {
    equation: "",
    answer: 0,
  };

  #max;
  #claimed = 0;
  constructor(max = 1) {
    this.#max = max;


  }
}

export default genetic_config;
export { DNA };

//console.log(Algebra.solve('1/2+3+((4-5)+3)'));