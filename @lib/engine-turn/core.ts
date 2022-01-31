import type { EngineTypes, Chart, Ctx, AuthenticatedAction } from "./types";
import { lastOf } from "@lib/array";

export const isErr = (arg: unknown): arg is string => typeof arg === "string";

export type Segment<ET extends EngineTypes> = {
  action: AuthenticatedAction<ET> | null;
  states: ET["states"][];
  ctx: Ctx<ET>;
  final: boolean;
};

export const getNextSegment = <ET extends EngineTypes>(
  chart: Chart<ET>,
  state: ET["states"],
  ctx: { numPlayers: number; options: ET["options"] },
  action?: AuthenticatedAction<ET>
): Segment<ET> | string | null => {
  const states: ET["states"][] = [];

  let collectingStates = true;
  let currentAction = action || null;
  let final = false;

  while (collectingStates) {
    const prevState = lastOf(states) || state;

    const nextState = chart[prevState.type as keyof Chart<ET>](
      prevState as any,
      ctx,
      currentAction
    );
    currentAction = null;
    if (isErr(nextState)) return nextState;
    if (nextState === true) {
      final = true;
      collectingStates = false;
      continue;
    }
    if (nextState !== null) {
      states.push(nextState);
      continue;
    }
    collectingStates = false;
  }

  return states.length > 0
    ? {
        action: currentAction || null,
        states,
        ctx,
        final,
      }
    : null;
};

export const getInitialSegment = <ET extends EngineTypes>(
  chart: Chart<ET>,
  initialState: ET["states"],
  ctx: Ctx<ET>
): Segment<ET> | string => {
  const initialSegment = getNextSegment(chart, initialState, ctx);

  if (isErr(initialSegment))
    return `First update failed with error message: ${initialSegment}`;

  const states =
    initialSegment === null
      ? [initialState]
      : [initialState, ...initialSegment.states];

  return {
    states,
    action: null,
    ctx,
    final: initialSegment === null ? false : initialSegment.final,
  };
};
