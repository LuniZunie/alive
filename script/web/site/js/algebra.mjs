class BigPart {
  #dat = 0x0; // 0000_00_0000_00_00
  /*
    ^ dat bit structure
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
  */

  #datConfig = Object.freeze({
    mask: {
      method: {
        /*
          or   (bin | mask) > mask
          and  (bin & mask) === mask
          eql  (bin ^ mask) === 0
         */

        positive: 0x3FFE,         //  1111_11_1111_11_10 (or)
        negative: 0x3FFD,         //  1111_11_1111_11_01 (or)

        even: 0x3FFB,             //  1111_11_1111_10_11 (or)
        odd: 0x3FF7,              //  1111_11_1111_01_11 (or)

        integer: 0x3FEF,          //  1111_11_1110_11_11 (or)
        float: 0x3FDF,            //  1111_11_1101_11_11 (or)
        rational: 0x3FBF,         //  1111_11_1011_11_11 (or)
        irrational: 0x3F7F,       //  1111_11_0111_11_11 (or)

        real: 0x3EFF,             //  1111_11_1110_11_11 (or)
        imaginary: 0x3DFF,        //  1111_01_1111_11_11 (or)

        zero: 0x3BFF,             //  1110_11_1111_11_11 (or)
        infinite: 0x37FF,         //  1101_11_1111_11_11 (or)
        notNumber: 0x2FFF,        //  1011_11_1111_11_11 (or)
        undefined: 0x1FFF,        //  0111_11_1111_11_11 (or)

        natural: [
          0x3FFB,                 //  0000_00_0001_00_01 (and)
          0x3FF7,                 //  1110_11_1111_11_11 (or)
        ],

        positiveInfinity: 0x801,  //  0010_00_0000_00_01 (and)
        negativeInfinity: 0x802,  //  0010_00_0000_00_10 (and)

        falsy: [
          0xBFF,                  //  0010_11_1111_11_11 (or)
          0x3FFF,                 //  0000_00_0000_00_00 (eql)
        ],
        truthy: 0x3FFF,           //  1111_01_1111_11_00 (or)

        NaN: 0xFFF,               //  0011_11_1111_11_11 (or)
        null: 0x3FFF,             //  0000_00_0000_00_00 (eql)
      },
      error: {
        and: { // (bin ^ mask) === 0 or (bin & mask) === mask
          require: [  //  id    required ids                              mask
            0x0,      //  ps                                              0000_00_0000_00_00
            0x0,      //  ng                                              0000_00_0000_00_00

            0x0,      //  ev                                              0000_00_0000_00_00
            0x0,      //  od                                              0000_00_0000_00_00

            0x140,    //  in    rt rl                                     0000_01_0100_00_00
            0x140,    //  fl    rt rl                                     0000_01_0100_00_00
            0x100,    //  rt    rl                                        0000_01_0000_00_00
            0x100,    //  ir    rl                                        0000_01_0000_00_00

            0x0,      //  rl                                              0000_00_0000_00_00
            0x0,      //  ig                                              0000_00_0000_00_00

            0x114,    //  zr    rl in ev                                  0000_01_0001_01_00
            0x0,      //  if                                              0000_00_0000_00_00
            0x0,      //  nt                                              0000_00_0000_00_00
            0x0,      //  ud                                              0000_00_0000_00_00
          ]
        },
        or: {
          require: [  //  id    required ids                              mask
            0x900,    //  ps    if rl                                     0010_01_0000_00_00
            0x900,    //  ng    if rl                                     0010_01_0000_00_00

            0x10,     //  ev    in                                        0000_00_0001_00_00
            0x10,     //  od    in                                        0000_00_0001_00_00

            0xC,      //  in    ev od                                     0000_00_0000_11_00
            0x3,      //  fl    ps ng                                     0000_00_0000_00_11
            0x30,     //  rt    in fl                                     0000_00_0011_00_00
            0x3,      //  ir    ps ng                                     0000_00_0000_00_11

            0xC0,     //  rl    rt ir                                     0000_00_1100_00_00
            0x0,      //  ig                                              0000_00_0000_00_00

            0x0,      //  zr                                              0000_00_0000_00_00
            0x3,      //  if    ps ng                                     0000_00_0000_00_11
            0x0,      //  nt                                              0000_00_0000_00_00
            0x0,      //  ud                                              0000_00_0000_00_00
          ],
          conflict: [ //  id    conflict ids                              mask
            0x3600,   //  ps    ud nt zr ig                               1101_10_0000_00_00
            0x3600,   //  ng    ud nt zr ig                               1101_10_0000_00_00

            0x3AA8,   //  ev    ud nt if ig ir fl od                      1110_10_1010_10_00
            0x3EA4,   //  od    ud nt if zr ig ir fl ev                   1111_10_1010_01_00

            0x3AA0,   //  in    ud nt if ig ir fl                         1110_10_1010_00_00
            0x3E9C,   //  fl    ud nt zr if ig ir in od ev                1111_10_1001_11_00
            0x3A80,   //  rt    ud nt if ig ir                            1110_10_1000_00_00
            0x3E7C,   //  ir    ud nt if zr ig rt fl in od ev             1111_10_0111_11_00

            0x3A00,   //  rl    ud nt if ig                               1110_10_0000_00_00
            0x3DFF,   //  ig    ud nt if zr rl ir rt fl in ev od ng ps    1111_01_1111_11_11

            0x3AAB,   //  zr    ud nt if ig ir fl od ng ps                1110_10_1010_10_11
            0x37FC,   //  if    ud nt zr ig rl ir rt fl in ev od          1101_11_1111_11_00
            0x2FFF,   //  nt    ud if zr ig rl ir rt fl in ev od ng ps    1011_11_1111_11_11
            0x1FFF,   //  ud    nt if zr ig rl ir rt fl in ev od ng ps    0111_11_1111_11_11
          ],
        },
      },
    },
  });
}