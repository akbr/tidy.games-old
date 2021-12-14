import type { Cards, Cities } from "./types";

export const cardNumbers: {
  [Type in Cards]: number;
} = {
  1: 15,
  2: 8,
  3: 8,
  4: 8,
  5: 8,
  6: 8,
  10: 8,
  s: 15,
  d: 6,
  b: 3,
  m: 3,
  w: 3,
  h: 3,
};

export const handOrder: Cards[] = [
  "s",
  1,
  2,
  3,
  4,
  5,
  6,
  10,
  "h",
  "d",
  "w",
  "b",
  "m",
];

export const cardGlyphs: {
  [Type in Cards]: string;
} = {
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  10: "🔟",
  s: "🎃",
  d: "🥁",
  b: "✝️",
  m: "🗝️",
  w: "❄️",
  h: "🦸🏿‍♀️",
};

export const adjacencyList: Record<Cities, Cities[]> = {
  tor: ["gen", "mil"],
  mil: ["tor", "gen", "par", "mod", "man", "ven"],
  ven: ["mil", "man", "fer"],
  gen: ["tor", "mil", "par"],
  man: ["mil", "ven", "fer", "mod"],
  par: ["gen", "mil", "mod", "luc"],
  mod: ["mil", "man", "fer", "bol", "luc", "par"],
  fer: ["ven", "bol", "mod", "man"],
  luc: ["par", "mod", "bol", "fir"],
  bol: ["fer", "mod", "fir", "urb"],
  fir: ["luc", "mod", "bol", "urb", "spo", "rom", "sie"],
  sie: ["fir", "rom"],
  urb: ["fir", "bol", "anc", "spo"],
  spo: ["fir", "urb", "anc", "nap", "rom"],
  anc: ["urb", "nap", "spo"],
  rom: ["sie", "fir", "spo", "nap"],
  nap: ["rom", "spo", "anc"],
};
