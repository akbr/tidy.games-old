import { Spec } from "./types";
import { Machine, Step } from "./machine";

export type PlayerFn<S extends Spec> = (step: Step<S> | string) => void;

export const createGame = <S extends Spec>(machine: Machine<S>) => {
  const playerFns: (PlayerFn<S> | null)[] = Array.from(
    { length: machine.get().ctx.numPlayers },
    () => null
  );
  const actionQueue: [number, S["actions"]][] = [];

  let working = false;

  return {
    submit: function submit(player: number, action: S["actions"]) {
      if (working) {
        actionQueue.push([player, action]);
        return;
      }

      const result = machine.submit(action, player);
      if (typeof result === "string") {
        const fn = playerFns[player];
        fn && fn(result);
        return;
      }

      // Ensure every playerFn gets the current step before processing the next one
      working = true;
      playerFns.forEach((fn, idx) => fn && fn(machine.get(idx - 1)));
      working = false;

      if (actionQueue.length) {
        const [nextPlayer, nextAction] = actionQueue.shift()!;
        submit(nextPlayer, nextAction);
      }
    },
    setPlayerFn: (idx: number, fn: PlayerFn<S> | null) => {
      idx = idx + 1;
      if (idx < 0 || idx > playerFns.length - 1) return "Invalid player index.";
      playerFns[idx] = fn;
      if (fn) fn(machine.get(idx - 1));
    },
  };
};
