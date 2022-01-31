import type {
  EngineTypes,
  Chart,
  GetInitialState,
  AuthenticatedAction,
  Ctx,
} from "./types";
import type { Segment } from "./core";
import { lastOf } from "@lib/array";
import { getInitialSegment, getNextSegment, isErr } from "./core";

export type MachineSpec<ET extends EngineTypes> = {
  chart: Chart<ET>;
  getInitialState: GetInitialState<ET>;
  adaptSegment?: (update: Segment<ET>, player: number) => Segment<ET>;
} & DefaultOptions<ET>;

type DefaultOptions<ET extends EngineTypes> = ET["options"] extends Object
  ? { getDefaultOptions: (numPlayers: number) => ET["options"] }
  : { getDefaultOptions?: (numPlayers: number) => ET["options"] };

export type MachineRecord<ET extends EngineTypes> = {
  ctx: Ctx<ET>;
  initialState: ET["states"];
  actions: AuthenticatedAction<ET>[];
};

export interface Machine<ET extends EngineTypes> {
  getSegment: (player?: number) => Segment<ET>;
  submit: (action: ET["actions"], player: number) => string | void;
  getRecord: () => MachineRecord<ET>;
}
const authAction = <ET extends EngineTypes>(
  action: ET["actions"],
  player: number,
  time: number
): AuthenticatedAction<ET> => ({
  ...action,
  player,
  time,
});

type MachineProps<ET extends EngineTypes> = {
  ctx: { numPlayers: number; options?: ET["options"] };
  initialState?: ET["states"];
  actions?: AuthenticatedAction<ET>[];
};

export const createMachineFactory = <ET extends EngineTypes>({
  chart,
  getInitialState,
  adaptSegment = (x) => x,
  getDefaultOptions = () => undefined,
}: MachineSpec<ET>) => {
  return function createMachine({
    ctx: inputCtx,
    initialState: inputState,
    actions: inputActions,
  }: MachineProps<ET>): Machine<ET> | string {
    const { numPlayers, options } = inputCtx;
    const ctx = {
      numPlayers,
      options: options || getDefaultOptions(numPlayers),
    };

    const initialState = inputState || getInitialState(ctx);
    if (isErr(initialState)) return initialState;

    const initialSegment = getInitialSegment(chart, initialState, ctx);
    if (isErr(initialSegment)) return initialSegment;

    let currentSegment = initialSegment;
    const actions = [...(inputActions || [])];

    return {
      getSegment: (player) =>
        player === undefined
          ? currentSegment
          : adaptSegment(currentSegment, player),
      submit: (action, player) => {
        const authed = authAction(action, player, Date.now());
        const res = getNextSegment(
          chart,
          lastOf(currentSegment.states),
          ctx,
          authed
        );
        if (isErr(res)) return res;
        if (res === null)
          return "State did not advance, but no error message was provided.";
        actions.push(authed);
        currentSegment = res;
      },
      getRecord: () => ({
        ctx,
        initialState,
        actions,
      }),
    };
  };
};
