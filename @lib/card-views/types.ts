export type Dimensions = {
  w: number;
  h: number;
};

export type GameDimensions = {
  card: Dimensions;
  table: Dimensions;
};

export type HandProps = {
  hand: string[];
} & GameDimensions;
