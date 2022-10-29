import { Board } from "./board.types";
import { createEntity } from "../utils";

export function getBlankBoard(): Board {
  return {
    assets: [],
    systems: [],
    cxns: [],
    transit: [],
  };
}

export function createBoard(): Board {
  return {
    assets: [0, 0],
    systems: [
      {
        name: "home",
        x: 100,
        y: 100,
        size: 20,
        color: "green",
        fleets: [{ player: 1, num: 100 }],
      },
      {
        name: "mid",
        x: 530,
        y: 199,
        size: 32,
        color: "purple",
        fleets: [],
      },
      {
        name: "ice",
        x: 610,
        y: 75,
        size: 12,
        color: "white",
        fleets: [{ player: 1, num: 2 }],
      },
      {
        name: "bad",
        x: 300,
        y: 400,
        size: 23,
        color: "red",
        fleets: [{ player: 2, num: 100 }],
      },
      {
        name: "sol",
        x: 32,
        y: 320,
        size: 14,
        color: "orange",
        fleets: [],
      },
      {
        name: "wat",
        x: 400,
        y: 30,
        size: 14,
        color: "blue",
        fleets: [],
      },
    ].map((d) => ({ ...d, id: d.name, type: "system" })),
    cxns: [
      { systems: ["home", "bad"] },
      { systems: ["home", "sol"] },
      { systems: ["bad", "sol"] },
      { systems: ["mid", "home"] },
      { systems: ["mid", "bad"] },
      { systems: ["mid", "ice"] },
      { systems: ["wat", "ice"] },
      { systems: ["wat", "home"] },
    ].map((d) => createEntity("cxn", d)),
    transit: [],
  };
}
