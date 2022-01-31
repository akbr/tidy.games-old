import type { EngineTypes, Chart, AuthenticatedAction } from "./types";
import type { Segment } from "./core";
import { getNextSegment } from "./core";
import type { Machine, MachineRecord } from "./machine";
import { lastOf } from "@lib/array";

export type StateActionList<ET extends EngineTypes> = (
  | ["state", ET["states"]]
  | ["action", AuthenticatedAction<ET>]
)[];

export function getStateActionList<ET extends EngineTypes>(
  chart: Chart<ET>,
  record: MachineRecord<ET>
) {
  const { ctx, initialState, actions } = record;

  const states: ET["states"][] = [initialState];
  const list: StateActionList<ET> = [["state", initialState]];

  for (let idx in actions) {
    const action = actions[idx];
    list.push(["action", action]);
    const { states: nextStates } = getNextSegment(
      chart,
      lastOf(states),
      ctx,
      action
    ) as Segment<ET>;
    states.push(lastOf(nextStates));
    const poo = nextStates.map((x) => ["state", x] as ["state", ET["states"]]);
    list.push(...poo);
  }

  return list;
}

export type Frame<ET extends EngineTypes> = Omit<Segment<ET>, "states"> & {
  state: ET["states"];
};

export function getClientFrames<ET extends EngineTypes>(
  segment: Segment<ET>,
  prevSegment?: Segment<ET>
) {
  const { states, action, final, ctx } = segment;
  const frames: Frame<ET>[] = [];

  const shouldAddTransitionFrame = prevSegment && action;
  if (shouldAddTransitionFrame) {
    frames.push({
      state: lastOf(prevSegment.states),
      action,
      final: false,
      ctx,
    });
  }

  states.forEach((state) =>
    frames.push({
      state,
      action: null,
      final: false,
      ctx,
    })
  );

  if (final === true) lastOf(frames).final = true;

  return frames;
}

export function createGame<ET extends EngineTypes>(machine: Machine<ET>) {
  type PlayerFn = (
    result: Segment<ET> | string,
    playerIndex: number
  ) => ET["actions"] | void;
  let playerFns: (PlayerFn | null)[] = Array.from(
    { length: machine.getSegment().ctx.numPlayers },
    () => null
  );
  let actionQueue: [number, ET["actions"]][] = [];

  function submit(player: number, action: ET["actions"]) {
    const result = machine.submit(action, player);

    if (typeof result === "string") {
      if (playerFns[player]) playerFns[player]!(result, player);
      return;
    }

    playerFns
      .map((fn, idx) => fn && fn(machine.getSegment(idx), idx))
      .forEach((action, player) => {
        action && actionQueue.push([player, action]);
      });

    if (actionQueue.length > 0) submit(...actionQueue.shift()!);
  }

  return {
    submit,
    setPlayerFn: (idx: number, fn: PlayerFn | null) => {
      if (idx < 0 || idx > playerFns.length - 1) return "Invalid player index.";
      playerFns[idx] = fn;
      if (fn) {
        const action = fn(machine.getSegment(idx), idx);
        if (action) submit(idx, action);
      }
    },
  };
}

export type Bot<ET extends EngineTypes> = (
  segment: Segment<ET> | string,
  player: number
) => ET["actions"] | void;
