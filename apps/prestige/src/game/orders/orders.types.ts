import { Fleet } from "../board/board.types";

export type TransitOrder = {
  type: "transitOrder";
  id: string;
  to: string;
  from: string;
  fleets: Fleet[];
};

export type Orders = TransitOrder;
