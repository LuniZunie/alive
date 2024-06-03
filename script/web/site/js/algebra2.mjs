class BigFloat {
  /*
    0-1: Sign
      00: pos
      01: neg
      11: 
   */
  #attrs = 0b0_0_0_0_00; // 6 bits - 5 attributes

  #neg = false;
  #int = []; // float integers
  #dec = []; // float decimals
  #div = 1; // for division

  get neg() {
    return this.#neg;
  }
  get int() {
    return this.#int;
  }
  get ints() {
    return this.#int.length;
  }
  get dec() {
    return this.#dec;
  }
  get decs() {
    return this.#dec.length;
  }

  constructor(v = 0) {
    const bgFlt = (v => {
      switch (typeof v) {
        case 'number':
        case 'bigint': v = v.toString(); break;
        case 'string': break;
        case 'boolean': {
          if (v) this.#int = [1];

          return this;
        } case 'object': {
          const forceArr = arr => Array.isArray(arr) ?
            arr
              .filter(isFinite)
              .filter(Number) :
            [];

          if (v === null) return this;
          else if (Array.isArray(v)) {
            switch (v.length) {
              case 1: {
                this.#int = forceArr(v[0]);

                return this;
              } case 2: {
                this.#int = forceArr(v[0]),
                  this.#dec = forceArr(v[1]);

                return this;
              } case 3: {
                this.#neg = !!v[0],
                  this.#int = forceArr(v[1]),
                  this.#dec = forceArr(v[2]);

                return this;
              } case 4: {
                this.#neg = !!v[0],
                  this.#int = forceArr(v[1]),
                  this.#dec = forceArr(v[2]),
                  this.#div = Number(v[3]) || 1;

              } default: return this;
            }
          } else {
            this.#neg = !!v.neg,
              this.#int = forceArr(v.int),
              this.#dec = forceArr(v.dec);

            return this;
          }
        } default: return this;
      }

      if (v[0] === '-')
        this.#neg = true,
          v = v.slice(1);

      const [ int, dec ] = v
        .split('.')
        .map(v => v
          .split('')
          .map(Number));

      this.#int = int ?? [],
        this.#dec = dec ?? [];

      return this;
    })(v);

    let nonZero = false;
    bgFlt.#int = bgFlt.#int
      .filter(function(v, i, arr) {
        if (v !== 0) return nonZero = true;
        return nonZero || i === arr.length - 1;
      });

    nonZero = false;
    bgFlt.#dec = bgFlt.#dec
      .reverse()
      .filter(function(v, i, arr) {
        if (v !== 0) return nonZero = true;
        return nonZero;
      })
      .reverse();

    return bgFlt;
  }

  // private methods
  #forceIntDenom(num, denom) { // force integer denominator
    if (!(num instanceof BigFloat)) num = new BigFloat(num);
    if (!(denom instanceof BigFloat)) denom = new BigFloat(denom);

    const mul = new BigFloat('1' + '0'.repeat(Math.max(num.decs, denom.decs))),
      numTmp = num.mul(mul),
      denomTmp = denom.mul(mul),
      gcd = this.#gtrCmnDiv(numTmp, denomTmp);
  }
  #gtrCmnDiv(a, b) { // greater common divisor
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    while (!b.isZero) {
      const t = b;
      b = a % b;
      a = t;
    }

    return a;
  }
  #loop(fn, opts = {}, ...args) {
    const {
      // return options
      functionReturn: fnRtn = '', // return the function (map / reduce / filter / find / findIndex / some / every)
      arrayReturn: arrRtn = '', // return the array (flat)
      returnRaw: rtnRaw = true, // return as BigFloat (true / false)

      // loop options
      includeInts: incInt = true, // loop through integers (true / false)
      includeDecs: incDec = true, // loop through decimals (true / false)

      // order options
      fromRight: inv = false, // loop from right to left (true / false)
    } = opts;

    const ints = incInt ?
      [ ...this.#int ].map((v, i, arr) => [ v, arr.length - i - 1 ]) :
      [];

    const decs = incDec ?
      [ ...this.#dec ].map((v, i) => [ v, -i - 1 ]) :
      [];

    const arr = inv ?
      ints.concat(decs).reverse() :
      ints.concat(decs);

    function post(arr) {
      if (inv) arr.reverse();

      switch (arrRtn) {
        case 'flat': return arr.flat();
        default: return arr;
      }
    }

    let rtn;
    switch (fnRtn) {
      case 'map': { // BigFloat.map(function(value, index, array, digitIndex, BigFloat) { ... }, thisValue)
        rtn = [ [], [] ];

        let i = 0;
        for (const [ v, dI ] of arr) {
          const fnRtn = fn.call(
            args[0],
            v, i++, arr,
            dI, this
          );

          if (dI < 0) rtn[0].push(fnRtn);
          else rtn[1].push(fnRtn);
        }

        rtn[0] = post(rtn[0]),
          rtn[1] = post(rtn[1]);

        if (rtnRaw)
          return new BigFloat({
            neg: this.#neg,
            int: rtn[1],
            dec: rtn[0],
            div: this.#div
          });
        else return inv ?
          rtn[1].concat(rtn[0]) :
          rtn[0].concat(rtn[1]);
      }
    }
  }

  // public methods
  get(i) {
    return i < 0 ?
      this.#dec[-i - 1] :
      this.#int[this.ints - i - 1];
  }

  // simple bitwise
  not() {
    this.#neg = !this.#neg;

    return this;
  }

  // simple comparison
  grt(b) { // greater than
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.#neg !== b.neg) return !a.#neg;
    else if (a.ints > b.ints) return !a.#neg;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return !a.#neg;
      else if (nA < nB) return a.#neg;
    }

    return false;
  }
  eql(b) { // equal
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.#neg !== b.neg) return false;
    else if (a.ints !== b.ints || a.decs !== b.decs) return false;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA !== nB) return false;
    }

    return true;
  }
  lst(b) { // less than
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.#neg !== b.neg) return a.#neg;
    else if (a.ints > b.ints) return a.#neg;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return a.#neg;
      else if (nA < nB) return !a.#neg;
    }

    return false;
  }

  // simple compound comparison
  grtEql(b) { // greater than or equal
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.#neg !== b.neg) return !a.#neg;
    else if (a.ints > b.ints) return !a.#neg;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return !a.#neg;
      else if (nA < nB) return a.#neg;
    }

    return true;
  }
  lstEql(b) { // less than or equal
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.#neg !== b.neg) return a.#neg;
    else if (a.ints > b.ints) return a.#neg;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return a.#neg;
      else if (nA < nB) return !a.#neg;
    }

    return true;
  }

  // complex comparison
  absGrt(b) { // absolute greater than
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.ints > b.ints) return true;
    else if (a.ints < b.ints) return false;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return true;
      else if (nA < nB) return false;
    }

    return false;
  }
  absEql(v) { // absolute equal
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.ints !== b.ints || a.decs !== v.decs) return false;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA !== nB) return false;
    }

    return true;
  }
  absLst(b) { // absolute less than
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.ints > b.ints) return false;
    else if (a.ints < b.ints) return true;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return false;
      else if (nA < nB) return true;
    }

    return false;
  }

  // complex compound comparison
  absGrtEql(b) { // absolute greater than or equal
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.ints > b.ints) return true;
    else if (a.ints < b.ints) return false;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = mxInt - 1; i >= -mxDec; i--) {
      nA = a.get(i), nB = b.get(i);

      if (nA > nB) return true;
      else if (nA < nB) return false;
    }

    return true;
  }
  absLstEql(b) { // absolute less than or equal
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    if (a.ints > b.ints) return false;
    else if (a.ints < b.ints) return true;

    const mxInt = Math.max(a.ints, b.ints),
      mxDec = Math.max(a.decs, b.decs);

    let nA, nB;
    for (let i = -mxDec; i < mxInt; i++) {
      if (i < 0)
        nA = a.#dec[-i - 1],
          nB = b.dec[-i - 1];
      else
        nA = a.#int[a.ints - i - 1],
          nB = b.int[b.ints - i - 1];

      if (nA > nB) return false;
      else if (nA < nB) return true;
    }

    return true;
  }

  // simple math
  add(v) {
    if (!(v instanceof BigFloat)) v = new BigFloat(v);

    if (this.#neg !== v.neg) return this.sub(v.toInverse());

    const int = [], mxInt = Math.max(this.ints, v.ints),
      dec = [], mxDec = Math.max(this.decs, v.decs);

    let carry = 0;
    for (let i = mxDec - 1; i >= 0; i--) {
      const sum = (this.#dec[i] ?? 0) + (v.dec[i] ?? 0) + carry;
      dec.unshift(sum % 10);
      carry = sum / 10 | 0;
    }

    for (let i = 0; i < mxInt; i++) {
      const j = this.ints - i - 1,
        k = v.ints - i - 1;

      const sum = (this.#int[j] ?? 0) + (v.int[k] ?? 0) + carry;
      int.unshift(sum % 10);
      carry = sum / 10 | 0;
    }
    int.unshift(carry);

    this.#int = int,
      this.#dec = dec;

    return this;
  }
  sub(v) {
    if (!(v instanceof BigFloat)) v = new BigFloat(v);

    if (this.#neg !== v.neg) return this.add(v.toInverse());
    else if (this.eql(v)) return new BigFloat(0);
    else if (this.lst(v)) return v.sub(this).not();

    const int = [], mxInt = Math.max(this.ints, v.ints),
      dec = [], mxDec = Math.max(this.decs, v.decs);

    let carry = 0;
    for (let i = mxDec - 1; i >= 0; i--) {
      const diff = (this.#dec[i] ?? 0) - (v.dec[i] ?? 0) - carry;
      dec.unshift((diff + 10) % 10);
      carry = diff < 0 ? 1 : 0;
    }

    for (let i = 0; i < mxInt; i++) {
      const j = this.ints - i - 1,
        k = v.ints - i - 1;

      const diff = (this.#int[j] ?? 0) - (v.int[k] ?? 0) - carry;
      int.unshift((diff + 10) % 10);
      carry = diff < 0 ? 1 : 0;
    }

    this.#int = int,
      this.#dec = dec;

    return this;
  }
  mul(b) {
    return console.log(this.#gtrCmnDiv(3,2));

    if (!(v instanceof BigFloat)) v = new BigFloat(v);

    const subProds = [],
      lpAmt = this.ints,
      vLpAmt = v.ints, vStart = -v.decs;

    for (let i = -this.decs; i < lpAmt; i++) {
      const subProd = [];

      const n1 = (i < 0 ?
        this.#dec[-i - 1] :
        this.#int[this.ints - i - 1]) ?? 0;

      let carry = 0;
      for (let j = vStart; j < vLpAmt; j++) {
        if (j === 0) subProd.unshift('.');

        const n2 = (j < 0 ?
          v.dec[-j - 1] :
          v.int[v.ints - j - 1]) ?? 0;

        const prod = n1 * n2 + carry;
        console.log(n1 * n2, prod, carry);
        subProd.unshift(prod % 10);
        carry = prod / 10 | 0;
      }
      subProd.unshift(carry);

      const obj = { int: [], dec: [], mode: 0 };
      for (const n of subProd)
        if (n === '.') obj.mode = 1;
        else if (obj.mode === 0) obj.int.push(n);
        else obj.dec.push(n);

      subProds.push(obj);
    }

    let sum = new BigFloat(0);
    for (let i = 0; i < subProds.length; i++) {
      const obj = subProds[i],
        shift = i - this.decs;

      if (shift < 0)
        for (let j = 0; j < -shift; j++)
          obj.dec.unshift(obj.int.pop() ?? 0);
      else if (shift > 0)
        for (let j = 0; j < shift; j++)
          obj.int.push(obj.dec.shift() ?? 0);

      sum = sum.add(new BigFloat(obj));
    }

    this.#neg = this.#neg !== v.neg,
      this.#int = sum.int,
      this.#dec = sum.dec;

    return this;
  }

  // intermediate math
  rem(b) { // remainder (js % operator)
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    const aNeg = a.#neg;
    if (aNeg) a.not();
    if (b.neg) b.not();

    while (a.absGrtEql(b)) a.sub(b);

    return aNeg ? a.not() : a;
  }
  mod(b) { // modulo (mathematical)
    let a = this;
    if (!(b instanceof BigFloat)) b = new BigFloat(b);

    const aNeg = a.#neg,
      bNeg = b.neg;
    if (aNeg) a.not();
    if (bNeg) b.not();

    while (a.absGrtEql(b)) a.sub(b);
    if (aNeg !== bNeg) a = b.sub(a);

    return bNeg ? a.not() : a;
  }

  // simple functions
  abs() { // absolute value
    this.#neg = false;

    return this;
  }
  toAbs() { // new absolute value
    return new BigFloat({
      neg: false,
      int: this.#int,
      dec: this.#dec,
    });
  }

  // checks
  get isZero() {
    return this.#int.length === 0 && this.#dec.length === 0;
  }

  // normal conversion
  toString() {
    return (this.#neg ? '-' : '') +
      this.#int.join('') +
      (this.decs ?
        '.' + this.#dec.join('') :
        '');
  }
  toNumber() {
    return Number(this.toString());
  }
  toBigInt() {
    return BigInt(this.toString());
  }

  // inverse conversion
  toInverse() {
    return new BigFloat({
      neg: !this.#neg,
      int: this.#int,
      dec: this.#dec,
    });
  }
  toInverseString() {
    return (this.#neg ? '' : '-') +
      this.#int.join('') +
      (this.decs ?
        '.' + this.#dec.join('') :
        '');
  }
  toInverseNumber() {
    return Number(this.toInverseString());
  }
  toInverseBigInt() {
    return BigInt(this.toInverseString());
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'string': return this.toString();
      default:
      case 'number': return this.toNumber();
      case 'bigint': return this.toBigInt();
    }
  }

  test(...args) {
    return this.#loop(...args);
  }
}

export { BigFloat };
export default {

};

function test(a, b) {
  const table = {
    remainder: { '++': [ 1, 1 ], '+-': [ 1, -1 ], '-+': [ -1, 1 ], '--': [ -1, -1 ] },
    modulo: { '++': [ 1, 1 ], '+-': [ 1, -1 ], '-+': [ -1, 1 ], '--': [ -1, -1 ] },
  };

  const ref = {
    remainder: [
      (a, b) => a % b,
      (a, b) => new BigFloat(a).rem(b).toNumber()
    ],
    modulo: [
      (a, b) => (a % b + b) % b,
      (a, b) => new BigFloat(a).mod(b).toNumber()
    ],
  }

  a = Math.abs(a), b = Math.abs(b);
  for (const [ fn, row ] of Object.entries(table)) {
    const [ fn1, fn2 ] = ref[fn];
    for (const [ cell, mul ] of Object.entries(row)) {
      a *= mul[0], b *= mul[1];

      const n1 = fn1(a, b), n2 = fn2(a, b);
      row[cell] = n1 === n2 ?
        `${n1} === ${n2}` :
        `${n1} !== ${n2}`;
    }
  }

  return table;
}

// console.table(test(7.5, 2.5));
function test2(...args) {
  const n = '12345.6789',
    bf = new BigFloat(n);

  args[1] ??= {};
  args[1].returnRaw = false;
  console.log(bf.test(...args));

  args[1].returnRaw = true;
  console.log(bf.test(...args).toNumber());
}
test2((v, i, a, dI, bf) => '1', {
  functionReturn: 'map',
  fromRight: true,
});

// console.log(new BigFloat(4).rem(2.5).toString());
// console.log(new BigFloat(-4).mod(-3).toString());
// console.log(new BigFloat('12.5').mul('-2')?.toString?.());