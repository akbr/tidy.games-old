type CondottiereCard =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 10
  | "s"
  | "d"
  | "b"
  | "m"
  | "w"
  | "h";

const cardIndex: [CondottiereCard, number][] = [
  [1, 15],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  [6, 8],
  [10, 8],
  ["s", 15],
  ["d", 6],
  ["b", 3],
  ["m", 3],
  ["w", 3],
  ["h", 3],
];

const cardIcons: [CondottiereCard, string][] = [
  [1, "1"],
  [2, "2"],
  [3, "3"],
  [4, "4"],
  [5, "5"],
  [6, "6"],
  [10, "10"],
  ["s", "❗"],
  ["d", "🥁"],
  ["b", "✝️"],
  ["m", "🗝️"],
  ["w", "❄️"],
  ["h", "🗡️"],
];

const getDeck = () => {
  const deck: CondottiereCard[] = [];
  cardIndex.forEach(([card, num]) => {
    while (num > 0) {
      deck.push(card);
      num--;
    }
  });
  return deck;
};
