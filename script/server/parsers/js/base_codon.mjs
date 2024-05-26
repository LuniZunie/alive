const codes = {
  num: [ 1, 2, 3, 4, 5, 6, 7, 8 ],
  char: [ 'a', 'c', 'y', 'l', 'p', 'd', 'f', 'm' ],
  ref: {
    1: 'a', 2: 'c', 3: 'y', 4: 'l',
    5: 'p', 6: 'd', 7: 'f', 8: 'm',

    a: 1, c: 2, y: 3, l: 4,
    p: 5, d: 6, f: 7, m: 8,
  }
};
const codonLen = 4;

const expected = [];
const expectedLen = codes.char.length ** codonLen;
for (let i = 0; i < expectedLen; i++) {
  const codon = i
    .toString(codes.char.length)
    .padStart(codonLen, '0')
    .split('')
    .map(v => codes.char[+v])
    .join('');

  expected.push(codon);
}

(async function() {
  const modOps = [ 'a & b || a * b % 0xFFFFFFFFn', 'a & b ? a ^ b : a * b % 0xEEEEEEEEn', 'a + b', 'a > b ? a - b : b - a' ]
    .map(v => new Function('a', 'b', `return ${v};`));

  function reverse(v) {
    return Array.isArray(v) ?
      v.reverse() :
      v
        .toString()
        .split('')
        .reverse()
        .join('');
  }

  function base36(v) {
    return typeof v === 'string' ?
      BigInt(parseInt(
        v.replace(/[^0-9a-z]/gi, ''),
        36
      )) :
      v.toString(36);
  }

  let totalTime = 0;
  let totalReqs = 0;
  function formatEST() {
    let ms, s, m, h;
    ms = totalTime / totalReqs * (expectedLen - totalReqs) | 0;

    s = ms / 1000 | 0,
      ms %= 1000;

    m = s / 60 | 0,
      s %= 60;

    h = m / 60 | 0,
      m %= 60;

    let rtn = '';
    if (h) rtn += `${h}h `;
    if (m || rtn) rtn += `${m.toString().padStart(2, '0')}m `;

    return rtn + `${s.toString().padStart(2, '0')}.${ms.toString().padEnd(3, '0')}s`;
  }

  let group = 2**8; // 256
  const maxPerSec = 200;
  let lastSec = 0;

  group = Math.min(group, 100, maxPerSec, expectedLen);

  const template = 'UPI0000000001';
  const idLength = expectedLen.toString(16).length;

  let start;
  let results = {};
  for (let i = 0; i <= expectedLen; i += group) {
    while (lastSec > maxPerSec) await new Promise(r => setTimeout(r, 100));

    if (i >= group) {
      totalReqs += group;
      totalTime += performance.now() - start;

      console.groupCollapsed(
        'Group %o%c /%i %c(%i /%i)\nEst. %s',
        i / group | 0,
        'color: gray;',
        Math.ceil(expectedLen / group),
        'color: gray; font-style: italic',
        Object.keys(results).length,
        expectedLen,
        formatEST()
      );
      console.log('New proteins: %o', Object.fromEntries(Object.entries(results).slice(-group)));
      console.log('Total proteins: %o', Object.keys(results).length);
      console.groupEnd();
    }

    start = performance.now();

    const UPIs = [];
    for (let j = 0; j < group && i + j <= expectedLen; j++)
      UPIs.push(`UPI${
        (i + j)
          .toString(16)
          .padStart(template.length - 3, '0')
      }`);

    lastSec += UPIs.length;
    setTimeout(() => lastSec -= UPIs.length, 1005);

    await fetch(
      `https://www.ebi.ac.uk/proteins/api/uniparc?offset=0&size=${UPIs.length}&upi=${UPIs.join(',')}&rfDdtype=%40`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
      .then(r => r.json())
      .then(function(json) {
        json.forEach(function(v) {
          const hexId = (parseInt(v.accession.replace(/^UPI0*/, ''), 16) - 1)
            .toString(16)
            .padStart(idLength, '0');

          const id = {
            short: BigInt(parseInt(hexId, 16)),
            long: BigInt(
              v.accession
                .slice(-idLength)
                .split('')
                .map(char => char.charCodeAt(0))
                .join('')
            ),
            hex: hexId,
          };

          const baseMods = [
            BigInt(v.sequence.checksum.length) * id.long,
            BigInt((v.signatureSequenceMatch?.length ?? v.sequence.checksum.length) * v.sequence.length) * id.long,
            base36(v.accession),
            base36(reverse(v.accession)),
            base36(v.sequence.checksum),
            base36(reverse(v.sequence.checksum)),
          ];

          const codon = id.short
            .toString(codes.char.length)
            .padStart(codonLen, '0')
            .split('')
            .map(v => codes.ref[+v + 1])
            .join('');

          results[codon] = {
            id,
            sequences: {
              short: v.sequence.checksum,
              long: v.sequence.content,
            },
            modifiers: baseMods.flatMap((v, i) =>
              baseMods
                .filter((_, j) => i < j)
                .flatMap(w => modOps.map(op => op(v, w)))
            ),
            attributes: v.signatureSequenceMatch ?? [],
            start: false,
            stop: false,
          };
        });
      });
  }

  console.groupCollapsed(
    'Group %o%c /%i %c(%i /%i)\nEst. %s',
    Math.ceil(expectedLen / group),
    'color: gray;',
    Math.ceil(expectedLen / group),
    'color: gray; font-style: italic',
    Object.keys(results).length,
    expectedLen,
    formatEST()
  );
  console.log('New proteins: %o', Object.fromEntries(Object.entries(results).slice(-group)));
  console.log('Total proteins: %o', Object.keys(results).length);
  console.groupEnd();

  console.log(results, Object.keys(results).length);

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
    else if (typeof prop === 'bigint') return `B${prop.toString(36)}`;
    else if (typeof prop === 'string') return `S${prop}`;
    else if (typeof prop === 'number') return (prop | 0) === prop ?
      `N${prop.toString(36)}` :
      `n${prop}`;
    else if (typeof prop === 'boolean') return +prop;
    else return prop;
  }

  console.log(JSON.stringify(propHandler(results)));
})();