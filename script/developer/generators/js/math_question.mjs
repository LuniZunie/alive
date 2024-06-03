function qa(q, a) {
  return { q, a };
}

const equations = {};

//^ LEVEL 0 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 10; i++)
    for (let j = 0; j + i < 10; j++)
      temp.push(qa(
        `${i}+${j}`,
        i + j
      ));

  equations[lvl] = temp;
})(0);

//^ LEVEL 1 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 10; i++)
    for (let j = 0; i - j >= 0; j++)
      temp.push(qa(
        `${i}-${j}`,
        i - j
      ));

  equations[lvl] = temp;
})(1);

//^ LEVEL 2 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 10; i++)
    for (let j = 10 - i; j < 10 && i + j >= 10; j++)
      temp.push(qa(
        `${i}+${j}`,
        i + j
      ));

  equations[lvl] = temp;
})(2);

//^ LEVEL 3 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 100; i++)
    for (let j = 0; i + j < 100; j++)
      temp.push(qa(
        `${i}+${j}`,
        i + j
      ));

  equations[lvl] = temp;
})(3);

//^ LEVEL 4 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 10; i < 18; i++)
    for (let j = 0; i - j >= 0 && j < 10; j++)
      temp.push(qa(
        `${i}-${j}`,
        i - j
      ));

  equations[lvl] = temp;
})(4);

//^ LEVEL 5 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 20; i++)
    for (let j = 0; i - j >= 0; j++)
      temp.push(qa(
        `${i}-${j}`,
        i - j
      ));

  equations[lvl] = temp;
})(5);

//^ LEVEL 6 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 100; i++)
    for (let j = 0; i - j >= 0; j++)
      temp.push(qa(
        `${i}-${j}`,
        i - j
      ));

  equations[lvl] = temp;
})(6);

//^ LEVEL 7 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i < 10; i++)
    for (let j = 0; j <= 2; j++)
      temp.push(qa(
        `${i}*${j}`,
        i * j
      ));

  equations[lvl] = temp;
})(7);

//^ LEVEL 8 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 10; i++)
    for (let j = 0; j <= 10; j++)
      temp.push(qa(
        `${i}*${j}`,
        i * j
      ));

  equations[lvl] = temp;
})(8);

//^ LEVEL 9 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 101; i <= 1000; i += i % (i / 2.1) + 1 | 0)
    for (let j = 101; j <= 1000; j += j % (j / 2.4) + 1 | 0)
      temp.push(qa(
        `${i}+${j}`,
        i + j
      ));

  equations[lvl] = temp;
})(9);

//^ LEVEL 10 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 10; i++)
    for (let j = 0; j <= 10; j++)
      if ((i / j | 0) === i / j)
        temp.push(qa(
          `${i}/${j}`,
          i / j
        ));
      else if (j === 0) temp.push(qa(
        `${i}/${j}`,
        undefined
      ));

  equations[lvl] = temp;
})(10);

//^ LEVEL 11 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 10; i++)
    for (let j = 0; j <= 10; j++)
      if ((i / j | 0) !== i / j && (i / j * 10 | 0) / 10 === i / j)
        temp.push(qa(
          `${i}/${j}`,
          i / j
        ));

  equations[lvl] = temp;
})(11);

//^ LEVEL 12 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 20; i++)
    for (let j = 0; j <= 20; j++)
      if ((i / j * 10 | 0) / 10 !== i / j && (i / j * 100 | 0) / 100 === i / j)
        temp.push(qa(
          `${i}/${j}`,
          i / j
        ));

  equations[lvl] = temp;
})(12);

//^ LEVEL 13 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 11; i <= 100; i++)
    for (let j = 0; j <= 100; j++)
      if ((i / j | 0) === i / j)
        temp.push(qa(
          `${i}/${j}`,
          i / j
        ));
      else if (j === 0) temp.push(qa(
        `${i}/${j}`,
        undefined
      ));

  equations[lvl] = temp;
})(13);

//^ LEVEL 14 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 100; i++)
    for (let j = 0; j <= 100; j++)
      if ((i / j | 0) !== i / j && (i / j * 10 | 0) / 10 === i / j)
        temp.push(qa(
          `${i}/${j}`,
          i / j
        ));

  equations[lvl] = temp;
})(14);

//^ LEVEL 15 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 200; i++)
    for (let j = 0; j <= 200; j++)
      if ((i / j * 10 | 0) / 10 !== i / j && (i / j * 100 | 0) / 100 === i / j)
        temp.push(qa(
          `${i}/${j}`,
          i / j
        ));

  equations[lvl] = temp;
})(15);

//^ LEVEL 16 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 90; i++)
    for (let j = 0; j <= 10; j += i % 3.7 + 1)
      temp.push(qa(
        `${i}+${j.toFixed(1)}`,
        +(i + j).toFixed(1)
      ));

  equations[lvl] = temp;
})(16);

//^ LEVEL 17 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 10; i <= 90; i++)
    for (let j = 0; j <= 10; j += i % 3.7 + 1)
      temp.push(qa(
        `${i}-${j.toFixed(1)}`,
        +(i - j).toFixed(1)
      ));

  equations[lvl] = temp;
})(17);

//^ LEVEL 18 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 0; i <= 50; i += i % 4.5 + 1)
    for (let j = 0; j <= 50; j += i % 3.7 + 1)
      temp.push(qa(
        `${i.toFixed(1)}+${j.toFixed(1)}`,
        +(i + j).toFixed(1)
      ));

  equations[lvl] = temp;
})(18);

//^ LEVEL 19 GENERATOR
(function(lvl) {
  const temp = [];
  for (let i = 50; i >= 0; i -= i % 4.5 + 1)
    for (let j = 0; j <= 50 && i - j >= 0; j += i % 3.7 + 1)
      temp.push(qa(
        `${i.toFixed(1)}-${j.toFixed(1)}`,
        +(i - j).toFixed(1)
      ));

  equations[lvl] = temp;
})(19);

console.log(equations);
console.log(equations[Object.keys(equations).length - 1]);