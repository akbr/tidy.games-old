export type Fleet = {
  player: number;
  num: number;
};

export type System = {
  type: "system";
  id: string;
  name: string;
  x: number;
  y: number;
  fleets: Fleet[];
  size: number;
  color: string;
};

export type Cxn = {
  type: "cxn";
  id: string;
  systems: System["id"][];
};

export type Transit = {
  type: "transit";
  id: string;
  to: string;
  from: string;
  distance: number;
  fleets: Fleet[];
};

export type Board = {
  systems: System[];
  transit: Transit[];
  cxns: Cxn[];
  assets: number[];
};
