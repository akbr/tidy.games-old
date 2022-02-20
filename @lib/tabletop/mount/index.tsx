import { FunctionComponent, render } from "preact";
import { createMeter, MeterStatus } from "@lib/state/meter";

import { createMachine, GameDefinition, getFrames, Spec } from "..";
import { Frame, createActionFns, ConnectedActions } from "../utils";
import { MachineOptions } from "../machine";

import { DebugPanel } from "./debug/DebugPanel";

export type Room = {
  player: number;
};

export type ViewProps<S extends Spec> = {
  room: Room;
  frame: Frame<S>;
  meter: MeterStatus<Frame<S>>;
  actions: ConnectedActions<S>;
};

export function mount<S extends Spec>(
  def: GameDefinition<S>,
  options: MachineOptions<S>,
  $el: HTMLElement,
  Game: FunctionComponent<ViewProps<S>>
) {
  const machine = createMachine(def, options);
  if (typeof machine === "string") throw new Error(machine);
  const meter = createMeter<Frame<S>>();

  const nextRender = () => {
    const frames = getFrames(machine.get());
    meter.push(...frames);
  };

  const actions = createActionFns(def.actionStubs, (player, action) => {
    const res = machine.submit(action, player);
    if (res) return console.warn(res);
    nextRender();
  });

  meter.subscribe((meter) => {
    const viewProps = {
      frame: meter.state,
      meter,
      actions,
      room: { player: 0 },
    };

    render(
      <DebugPanel {...viewProps} machine={machine}>
        <Game {...viewProps} />
      </DebugPanel>,
      $el
    );
  });

  nextRender();

  return { machine, actions, meter };
}
