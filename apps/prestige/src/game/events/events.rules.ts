import { distanceBetween } from "@lib/geometry";
import { EventLogic, TransitArrive, TransitBattle } from "./events.types";
import { getID, getById } from "../utils";

const moveSpeed = 10;

export const transitArrive: EventLogic<TransitArrive> = {
  getNext: (board) => {
    const arrivals = board.transit
      .map((transit) => {
        const { to, from, distance } = transit;

        const fromSystem = getById(board.systems, from)!;
        const toSystem = getById(board.systems, to)!;
        const totalDistance = distanceBetween(
          fromSystem.x,
          fromSystem.y,
          toSystem.x,
          toSystem.y
        );
        const distanceLeft = totalDistance - distance;
        const numTicksLeft = distanceLeft / 10;
        return [numTicksLeft, transit] as const;
      })
      .sort(([ticksA], [ticksB]) => ticksA - ticksB);

    if (arrivals.length === 0) return null;

    const [ticks, transit] = arrivals.shift()!;

    return { type: "transitArrive", ticks, transit, id: getID() };
  },
  resolve: (board, { transit }) => {
    const { to, id, fleets } = transit;
    const toSystem = getById(board.systems, to)!;

    fleets.forEach((f) => {
      const mod = toSystem.fleets.find((x) => x.player === f.player);
      if (mod) {
        mod.num += f.num;
      } else {
        toSystem.fleets.push({ player: f.player, num: f.num });
      }
    });

    board.transit = board.transit.filter((t) => t.id !== id);
  },
};
export const transitBattle: EventLogic<TransitBattle> = {
  getNext: (board) => {
    const events = board.transit
      .map((me) => {
        const potentialBattles = board.transit.filter(
          (them) =>
            them !== me &&
            them.to === me.from &&
            them.fleets[0].player !== me.fleets[0].player
        );
        if (potentialBattles.length === 0) return null;
        const s1 = getById(board.systems, me.to)!;
        const s2 = getById(board.systems, me.from)!;
        const totalDistance = distanceBetween(s1.x, s1.y, s2.x, s2.y);

        const battles = potentialBattles
          .map((them) => {
            const event: TransitBattle = {
              type: "transitBattle",
              ticks:
                (totalDistance - me.distance - them.distance) / (moveSpeed * 2),
              transits: [me, them],
              id: getID(),
            };
            return event;
          })
          .sort((e1, e2) => e1.ticks - e2.ticks);
        return battles[0];
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .sort((e1, e2) => e1.ticks - e2.ticks);

    return events.length === 0 ? null : events[0];
  },
  beforeResolve: (e, board) => {
    e.transits = e.transits.map(
      (t) => board.transit.find((tt) => tt.id === t.id)!
    );
  },
  resolve: (board, e) => {
    board.transit = board.transit.filter((t) => {
      let res = e.transits.findIndex((et) => et.id === t.id) === -1;
      return res;
    });
  },
};

export const keyedEventLogics = {
  transitArrive,
  transitBattle,
};

export const eventLogics = Object.values(keyedEventLogics);
