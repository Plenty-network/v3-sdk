import BigNumber from "bignumber.js";

import { Ladder } from "../types";

// Divisor / multipler for numbers of precision 2^80
export const Q80 = new BigNumber(2).pow(80);

export const ZERO_VAL = new BigNumber(0);

// The possible tick (-ve or +ve)
export const MAX_TICK = 1048575;

// For binary exponentiation using positive ticks
export const POSITIVE_LADDER: Ladder = {
  0: { v: new BigNumber("38687560557337355742483221"), offset: -85 },
  1: { v: new BigNumber("38689494983725479307861971"), offset: -85 },
  2: { v: new BigNumber("38693364126677775184793561"), offset: -85 },
  3: { v: new BigNumber("38701103573421987005215721"), offset: -85 },
  4: { v: new BigNumber("38716587111352494729706462"), offset: -85 },
  5: { v: new BigNumber("38747572773653928660613512"), offset: -85 },
  6: { v: new BigNumber("38809618513447185627569983"), offset: -85 },
  7: { v: new BigNumber("38934008210058939100663682"), offset: -85 },
  8: { v: new BigNumber("39183984934869404935943141"), offset: -85 },
  9: { v: new BigNumber("39688763633815974521145659"), offset: -85 },
  10: { v: new BigNumber("40717912888646086984030507"), offset: -85 },
  11: { v: new BigNumber("42856962434838368098529959"), offset: -85 },
  12: { v: new BigNumber("47478079282778087338933597"), offset: -85 },
  13: { v: new BigNumber("29134438707490415855866100"), offset: -84 },
  14: { v: new BigNumber("43882733799120415566608322"), offset: -84 },
  15: { v: new BigNumber("49778031622173924435819796"), offset: -83 },
  16: { v: new BigNumber("32025492072892644517427309"), offset: -80 },
  17: { v: new BigNumber("53023938993515524338629870"), offset: -76 },
  18: { v: new BigNumber("36338278329035183585718600"), offset: -66 },
  19: { v: new BigNumber("34133361681864713959105863"), offset: -47 },
};

// For binary exponentiation using negative ticks
export const NEGATIVE_LADDER: Ladder = {
  0: { v: new BigNumber("19341845997356488514015570"), offset: -84 },
  1: { v: new BigNumber("2417609866154190654524678"), offset: -81 },
  2: { v: new BigNumber("38677889876083546261210550"), offset: -85 },
  3: { v: new BigNumber("38670155071614559132217310"), offset: -85 },
  4: { v: new BigNumber("19327345051392939314248854"), offset: -84 },
  5: { v: new BigNumber("19311889358453304431405214"), offset: -84 },
  6: { v: new BigNumber("77124060166079386301517011"), offset: -86 },
  7: { v: new BigNumber("38438828813936263312862610"), offset: -85 },
  8: { v: new BigNumber("76387211720013513967242610"), offset: -86 },
  9: { v: new BigNumber("75415686436335201065707301"), offset: -86 },
  10: { v: new BigNumber("73509547540888574991368714"), offset: -86 },
  11: { v: new BigNumber("17460146398643019245576278"), offset: -84 },
  12: { v: new BigNumber("126085780994910985395717054"), offset: -87 },
  13: { v: new BigNumber("102735988268212419722671870"), offset: -87 },
  14: { v: new BigNumber("68208042073114503830679361"), offset: -87 },
  15: { v: new BigNumber("60130046442422405275353178"), offset: -88 },
  16: { v: new BigNumber("11682706336100247487260846"), offset: -88 },
  17: { v: new BigNumber("56449132412055094618915006"), offset: -95 },
  18: { v: new BigNumber("20592303012757789234393034"), offset: -103 },
  19: { v: new BigNumber("1370156647050591448120178"), offset: -118 },
};

// Tick spacing to initial price boundary range
export const SPACE_TO_RANGE: { [key: number]: number } = {
  1: 10,
  10: 100,
  60: 200,
  200: 500,
};
