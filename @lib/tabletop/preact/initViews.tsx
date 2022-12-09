import { render } from "preact";
import { DevWrapper } from "@lib/meter/preact";
import { createEmitter } from "@lib/emitter";

import type { Spec } from "../core";
import type { Client } from "../client";
import type { AppProps, DialogView, SetDialog } from "./types";

import { ViewInputs } from "./types";

import { StateDisplay } from "./views/StateDisplay";

import { Root } from "./views/Root";

export function initViews<S extends Spec>(
  client: Client<S>,
  $el: HTMLElement,
  options: { dev: boolean }
) {
  $el.innerHTML = "";

  // Dom scaffolding (outside the react update structure)
  // ------------------------------------------------------
  render(
    <section id="tabletop-root" class="h-full flex">
      <section id="tabletop-dev" class="h-full" />
      <section id="tabletop-game" class="h-full flex-grow" />
      <section id="tabletop-aside" class="h-full" />
    </section>,
    $el
  );

  const dom = {
    $root: document.getElementById("tabletop-root")!,
    $dev: document.getElementById("tabletop-dev")!,
    $game: document.getElementById("tabletop-game")!,
    $aside: document.getElementById("tabletop-aside")!,
  };
  // ------------------------------------------------------

  const dialogEmitter = createEmitter<DialogView<S> | null>(null);
  const setDialog: SetDialog<S> = (Dialog) => {
    //@ts-ignore
    dialogEmitter.next(Dialog ? () => Dialog : null);
  };

  const appProps: AppProps<S> = {
    client,
    dialogEmitter,
    setDialog,
  };

  function internalRender(viewInputs: ViewInputs<S>) {
    const rootProps = { appProps, viewInputs };
    if (options.dev) {
      render(
        <DevWrapper meter={client.gameMeter} stateDisplay={StateDisplay} />,
        dom.$dev
      );
    }

    render(<Root {...rootProps} />, dom.$game);
  }

  return {
    dialogEmitter,
    setDialog,
    render: internalRender,
    dom,
  };
}

export default initViews;
