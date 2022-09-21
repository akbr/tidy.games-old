export type Board = {
  systems: System[];
  transit: TransitFleet[];
  cxns: Cxn[];
};

export type Orders = Order[];

// ---

export type System = {
  id: string;
  name: string;
  x: number;
  y: number;
  fleets: Fleet[];
  size: number;
  color: string;
};

export type Fleet = {
  player: number;
  num: number;
};

export type TransitFleet = Fleet & {
  id: string;
  to: string;
  from: string;
  distance: number;
};

export type Cxn = [string, string];

export type MoveOrder = {
  id: string;
  from: string;
  to: string;
  player: number;
  num: number;
};

export type Order = MoveOrder;
