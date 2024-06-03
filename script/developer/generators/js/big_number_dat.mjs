import * as qolImports from "../../../web/site/js/qol.mjs";
for (const [k, v] of Object.entries(qolImports)) globalThis[k] = v;

const structStr = `
  bit   dec     hex     ID  name

  ##Sign
  0     1       1       ps  positive
  1     2       2       ng  negative

  ##Even/Odd
  2     4       4       ev  even
  3     8       8       od  odd

  ##Other Properties
  4     16      10      pr  prime

  ##Type
  5     32      20      it  integer
  6     64      40      fl  float
  7     128     80      rt  rational
  8     256     100     ir  irrational
  9     512     200     iv  inverse

  ##Plane
  10    1024    400     rl  real
  11    2048    800     ig  imaginary

  ##Special Type
  12    4096    1000    zr  zero
  13    8192    2000    if  infinite
  14    16384   4000    nt  not_a_number
  15    32768   8000    ud  undefined
`;

const
  groups = [],
  mask = {
    bits: 32,
    struct: {
      bitGate: {
        i: 0,
        len: 3,
        v: [
          'err',
          'and', 'nand',
          'or', 'nor',
          'xor', 'xnor',
        ]
      },
      dwordGate: {
        i: 3,
        len: 4,
        v: [
          'err',
          'eql', 'neql',
          'and', 'nand',
          'or', 'nor',
          'xor', 'xnor',
        ]
      },
      data: {
        i: 7,
        len: 24,
      },
      fill: {
        i: 31,
        len: 1
      },
    }
  },
  struct = BitConstruct(structStr);

function BitConstruct(bitsStr) {
  let i = 0;
  const bitsArr = bitsStr
    .trim()
    .split('\n')
    .map(v => v.trim())
    .filter(function(v) {
      if (v.length === 0) return false;
      else if (v[0] === '#') {
        if (v[1] === '#') groups.push(i - 1);
        return false;
      }

      i++;
      return true;
    });

  groups.push(i - 1);

  const catsStr = bitsArr.splice(0, 1)[0];

  let
    wasSpace = true,
    foundId = false;

  const cats = [];
  for (let i = 0; i < catsStr.length; i++) {
    const
      ch = catsStr[i],
      lwCh = ch.toLowerCase();

    if (ch === ' ') wasSpace = true;
    else {
      if (wasSpace) cats.push([ lwCh, i ]);
      else cats[cats.length - 1][0] += lwCh;

      if (!foundId && lwCh !== ch)
        cats[cats.length - 1][2] = foundId = true;

      wasSpace = false;
    }
  }

  const bitsObj = {};
  for (const v of bitsArr) {
    let id = '';
    const bitObj = {};
    for (let i = 0; i < cats.length; i++) {
      const [ cat, pos, isId ] = cats[i];

      const val = v.slice(pos, cats[i + 1]?.[1] ?? v.length).trim();
      if (isId) id = val;

      bitObj[cat] = val;
    }

    bitsObj[id] = bitObj;
  }

  return bitsObj;
}

function strBin(bin) {
  return (bin >>> 0)
    .toString(2)
    .padStart(32, '0');
}

function formatMask(maskStr) {
  const str = strBin(maskStr);

  return str
    .split('')
    .flatMap(function(v, i) {
      i = mask.bits - i - 1;
      if (i > 0) {
        for (const struct of Object.values(mask.struct))
          if (i === struct.i) return [ v, '_' ];

        for (const group of groups)
          if (i - mask.struct.data.i === group) return [ v, '_' ];
      }

      return v;
    })
    .join('');
}

function CreateMask(gates = {}, ...ids) {
  if (typeof gates !== 'object') gates = [ gates ];

  const {
    d: dwordGate1, dword: dwordGate2, 0: dwordGate3,
    b: bitGate1, bit: bitGate2, 1: bitGate3,
  } = gates;

  let dwordGate, bitGate;
  if (dwordGate1 && dwordGate2 && dwordGate3) throw new Error('Only one DWORD gate can be passed');
  else dwordGate = dwordGate1 ?? dwordGate2 ?? dwordGate3 ?? 'err';

  if (bitGate1 && bitGate2 && bitGate3) throw new Error('Only one bit gate can be passed');
  else bitGate = bitGate1 ?? bitGate2 ?? bitGate3 ?? 'err';

  const dwordGates = {
    eql: 0, neql: 0, // equal, not equal

    and: 0, nand: 0, // (ALL) comparisons equal, (< ALL) comparisons equal

    or: 1, nor: 1, // (1) or (> 1) comparisons equal, (0) comparisons equal
    xor: 1, xnor: 1, // (1) comparison equal, (0) or (> 1) comparison equal
  }

  const dwordData = {
    fill: dwordGates[dwordGate],
    data: 0,
    dwordGate: mask.struct.dwordGate.v.indexOf(dwordGate),
    bitGate: mask.struct.bitGate.v.indexOf(bitGate),
  }

  if (dwordData.dwordGate === -1) throw new Error(`Invalid DWORD gate: ${dwordGate}`);
  else if (dwordData.bitGate === -1) throw new Error(`Invalid bit gate: ${bitGate}`);

  dwordData.fill <<= mask.struct.fill.i;
  dwordData.data = dwordData.fill
    >> mask.struct.data.len
    >>> mask.len - mask.struct.data.i - mask.struct.data.len;
  dwordData.dwordGate <<= mask.struct.dwordGate.i;
  dwordData.bitGate <<= mask.struct.bitGate.i;

  let dword = Object.values(dwordData).reduce((a, b) => a | b);
  for (const id of ids)
    if (!struct[id]) throw new Error(`Invalid ID: ${id}`);
    else dword ^= struct[id].dec << mask.struct.data.i;

  return dword;
}

function ApplyDWORDMask(thisMask, n) {
  const
    dwordGate = mask.struct.dwordGate.v[
      (thisMask & 0b111_000)
        >>> mask.struct.dwordGate.i
    ];

  thisMask >>= mask.struct.data.i;

  switch (dwordGate) {
    case 'err': throw new Error('No DWORD gate exists for this mask');

    case 'eql': return n === thisMask;
    case 'neql': return n !== thisMask;

    case 'or': return ((n | thisMask) & ~thisMask) !== 0;
    case 'nor': return ((n | thisMask) & ~thisMask) === 0;

    case 'and': return ((n & thisMask) ^ thisMask) === 0;
    case 'nand': return ((n & thisMask) ^ thisMask) !== 0;

    case 'xor': {
      let v = (n | thisMask) & ~thisMask;
      if (v === 0) return false;

      v = Math.log2(v);
      return (v | 0) === v;
    } case 'xnor': {
      let v = (n | thisMask) & ~thisMask;
      if (v === 0) return false;

      v = Math.log2(v);
      return (v | 0) !== v;
    }

    default: throw new Error(`Invalid DWORD gate: ${dwordGate}`);
  }
}

function ApplyBitMask(thisMask, n) {
  const
    bitGate = mask.struct.bitGate.v[
      (thisMask & 0b111)
        >>> mask.struct.bitGate.i
    ];

  thisMask >>= mask.struct.data.i;

  switch (bitGate) {
    case 'err': throw new Error('No bit gate exists for this mask');

    case 'and': return thisMask & n;
    case 'nand': return ~(thisMask & n);

    case 'or': return thisMask | n;
    case 'nor': return ~(thisMask | n);

    case 'xor': return thisMask ^ n;
    case 'xnor': return ~(thisMask ^ n);

    default: throw new Error(`Invalid bit gate: ${bitGate}`);
  }
}

let
  timeout,
  logs = [], logsI = 0;
function create(...q) {
  const thisMask = CreateMask(...q);

  let hex;
  if (thisMask < 0) hex = `-0x${(-thisMask).toString(16)}`;
  else hex = `0x${thisMask.toString(16)}`;

  let
    rs, rj,
    i = logsI++;
  new Promise(function(resolve, reject) {
    rs = resolve,
      rj = reject
  })
    .then(name =>
      logs[i] = [
        '%c%s%c%s%c%s',
        'color: #b71',
        `"${name
          .toString()
          .replace(/\s/g, '_')}"`,
        'color: #d11',
        `(${thisMask})`,
        'color: #080',
        `"${hex}"`
      ]
    )
    .catch(() =>
      logs[i] = [
        '%c%s%c%s%c%s',
        'color: #b71',
        '',
        'color: #d11',
        `(${thisMask})`,
        'color: #080',
        `"${hex}"`
      ]
    );

  setTimeout(rj);

  clearTimeout(timeout);
  timeout = setTimeout(log, 1);

  return { name: rs };
}

function log() {
  let paddings = [];
  for (const log of logs)
    for (let i = 1; i < log.length; i++)
      paddings[i - 1] = Math.max(paddings[i - 1] ?? 0, log[i].toString().length);

  for (const log of logs) {
    let i = 0;
    const temp = log.shift().replace(/%.?/g, function(v) {
      if (v === '%c') {
        i++;
        return '%c';
      } else {
        const
          pad = paddings[i] - log[i++].toString().length + 2,
          padL = (pad / 2 | 0) + pad % 2,
          padR = (pad / 2 | 0) + pad % 1;

        return ' '.repeat(padL) + v + ' '.repeat(padR);
      }
    });

    console.log(temp, ...log);
  }

  logs = [];
}

{ // checks
  { // simple
    create('or', 'ps').name('positive check'),
      create('or', 'ng').name('negative check');

    create('or', 'ev').name('even check'),
      create('or', 'od').name('odd check');

    create('or', 'pr').name('prime check');

    create('or', 'it').name('integer check'),
      create('or', 'fl').name('float check'),
      create('or', 'rt').name('rational check'),
      create('or', 'ir').name('irrational check'),
      create('or', 'iv').name('inverse check');

    create('or', 'rl').name('real check'),
      create('or', 'ig').name('imaginary check');

    create('or', 'zr').name('zero check'),
      create('or', 'if').name('infinite check'),
      create('or', 'nt').name('not_a_number check'),
      create('or', 'ud').name('undefined check');
  }

  { // complex
    create('or', 'if', 'ig', 'rl', 'iv', 'ir', 'rt', 'fl', 'it', 'pr', 'od', 'ev', 'ng', 'ps').name('truthy check');
      create('nor', 'if', 'ig', 'rl', 'iv', 'ir', 'rt', 'fl', 'it', 'pr', 'od', 'ev', 'ng', 'ps').name('falsy check');

    create('and', 'it', 'ps').name('natural check 1'),
      create('or', 'zr').name('natural check 2');

    create('and', 'if', 'ps').name('positive infinity check'),
      create('and', 'if', 'ng').name('negative infinity check');

    create('or', 'ud', 'nt').name('NaN check');
    create('eql').name('null check');

    create('and', 'pr', 'ev').name('2 check'),
      create('and', 'pr', 'ev', 'ps').name('positive 2 check'),
      create('and', 'pr', 'ev', 'ng').name('negative 2 check');
  }
}

/* const thisMask = CreateMask({ b: 'and', d: 'and' }, 'ev', 'ng', 'ps');
console.log(thisMask);
if (thisMask < 0)
  console.log('%s', `-0x${(-thisMask).toString(16)}`),
  console.log('%s', `-0o${(-thisMask).toString(8)}`),
  console.log('%s', `-0b${(~thisMask + 1).toString(2)}`);
else
  console.log('%s', `0x${thisMask.toString(16)}`),
  console.log('%s', `0o${thisMask.toString(8)}`),
  console.log('%s', `0b${thisMask.toString(2)}`);

console.log('%o', `${formatMask(thisMask)}`);

console.log(ApplyBitMask(thisMask, 0b111));

const st1 = performance.now();
const l = 1e8;
for (let i = 0; i < l; i++)
  ApplyBitMask(thisMask, Math.random() * 0xFFFFFFFF | 0);

const
  et1 = performance.now(),
  dt1 = et1 - st1;

const st2 = performance.now();
for (let i = 0; i < l; i++)
  Math.random() * 0xFFFFFFFF | 0;

const
  et2 = performance.now(),
  dt2 = et2 - st2;

const dt = dt1 - dt2;

console.log(dt, dt / l, (dt / l * 1e6).toFixed(2)); */