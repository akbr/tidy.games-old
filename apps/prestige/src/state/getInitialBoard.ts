import { Board } from "./gameTypes";
import { nanoid } from "nanoid";

const getID = () => nanoid(10);

export function getInitialBoard(): Board {
  return {
    systems: [
      {
        name: "home",
        x: 100,
        y: 100,
        size: 20,
        color: "green",
        fleets: [],
        id: getID(),
      },
      {
        name: "mid",
        x: 530,
        y: 199,
        size: 32,
        color: "purple",
        fleets: [],
        id: getID(),
      },
      {
        name: "ice",
        x: 610,
        y: 75,
        size: 12,
        color: "white",
        fleets: [],
        id: getID(),
      },
      {
        name: "bad",
        x: 300,
        y: 400,
        size: 23,
        color: "red",
        fleets: [],
        id: getID(),
      },
      {
        name: "sol",
        x: 32,
        y: 320,
        size: 14,
        color: "orange",
        fleets: [],
        id: getID(),
      },
    ],
    cxns: [
      ["home", "bad"],
      ["home", "sol"],
      ["bad", "sol"],
      ["mid", "home"],
      ["mid", "bad"],
      ["mid", "ice"],
    ],
    transit: [],
  };
}
