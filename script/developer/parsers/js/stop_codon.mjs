// inject at https://www.pwrc.usgs.gov/BBL/Bander_Portal/login/speclist.php

let list;
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

list = Object.fromEntries(
  [ ...document.querySelectorAll("#spectbl > tbody > tr") ]
    .map(tr => {
      const arr = [ ...tr.children ]
        .filter((_, i) => i <= 2 || i == 5 || i == 8)
        .map(td => td.innerText.trim());

      if (arr[0].length != 4 || arr[0].match(new RegExp(`[${codes.num.join('')}]`, 'g'))?.length != 4) return;

      const obj = [
        arr[0]
          .split('')
          .map(char => '' + ref[char.toLowerCase()])
          .join(''),
        {
          id: +arr[0],
          code: arr[1],
          name: `${arr[3]}`,
          common: `${arr[2]}`,
          order: +arr[4],
        }
      ];

      if (obj[1].name == '') delete obj[1].name;

      return obj;
    })
    .filter(Boolean)
);

console.log(list);

let lastChar;
let offset = 0;
let wrap = 10;

let codons = Object.keys(list)
  .sort()
  .reduce(function(str, code, i, arr) {
    lastChar ??= code[0];

    const txt = `"${code}"`;

    if (lastChar !== code[0]) {
      str += `\n\n\t${txt},`;
      offset = i % wrap;
    } else if ((i - offset) % wrap == 0) str += `\n\t${txt},`;
    else str += ` ${txt},`;

    lastChar = code[0];

    if (i === arr.length - 1) str += `\n]`;

    return str;
  }, '[');

console.log(codons);

lastChar = undefined;
offset = 0;
wrap = 3;

let codonsObj = Object.entries(list)
  .sort()
  .reduce(function(str, [ code, obj ], i, arr) {
    lastChar ??= code[0];

    const txt = `"${code}":${JSON.stringify(obj)}`;

    if (lastChar !== code[0]) {
      str += `\n\n\t${txt},`;
      offset = i % wrap;
    } else if ((i - offset) % wrap == 0) str += `\n\t${txt},`;
    else str += ` ${txt},`;

    lastChar = code[0];

    if (i === arr.length - 1) str += `\n}`;

    return str;
  }, '{');

console.log(codonsObj);
console.log('Length:', Object.keys(list).length);