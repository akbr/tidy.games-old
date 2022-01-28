import type { EngineTypes, Update, Engine, Env } from "./";
import { isErr } from "./";

export interface Machine<ET extends EngineTypes> {
  getUpdate: (player?: number) => Update<ET>;
  submit: (action: ET["actions"], player?: number) => Update<ET> | string;
}

export const createMachine = <ET extends EngineTypes>(
  { getInitialUpdate, getNextUpdate, adaptUpdate }: Engine<ET>,
  env: Env,
  options: ET["options"]
): Machine<ET> | string => {
  // Interal state
  let update: Update<ET>;

  // Initital state
  const initialUpdate = getInitialUpdate(env, options);
  if (isErr(initialUpdate)) {
    return initialUpdate;
  } else {
    update = initialUpdate;
  }

  // If no error, return machine
  return {
    getUpdate: (player) =>
      player === undefined ? update : adaptUpdate(update, player),
    submit: (action, player) => {
      const res = getNextUpdate(update, {
        ...action,
        player,
      });
      if (isErr(res)) return res;
      if (res === null)
        return "State did not advance, but no error message was provided.";
      update = res;
      return update;
    },
  };
};
