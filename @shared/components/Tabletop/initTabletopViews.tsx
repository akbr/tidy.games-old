import { h, render } from "preact";

import { Spec, Cart } from "@lib/tabletop";
import { Client } from "@lib/tabletop/client";

import { App, AppViews } from "./App";
import { DevPanel } from "./DevPanel";

export type InitAppProps<S extends Spec> = {
  client: Client<S>;
  cart: Cart<S>;
  views: AppViews<S>;
  $el: HTMLElement;
  dev: boolean;
};

export function initTabletopViews<S extends Spec>({
  client,
  views,
  cart,
  dev,
  $el,
}: InitAppProps<S>) {
  // render permanent shell
  render(
    <section type="tabletop-root" class="h-full w-full flex">
      <section id="_dev" class="relative h-full"></section>
      <section id="_game" class="relative h-full flex-grow" />
    </section>,
    $el
  );

  const $game = document.getElementById("_game")!;
  client.subscribe((state) => {
    render(<App state={state} views={views} cart={cart} />, $game);
  });
  if (dev) {
    const $dev = document.getElementById("_dev")!;
    client.meter.subscribe(() => {
      render(<DevPanel client={client} />, $dev);
    });
    client.subscribe(([type]) => {
      if (type === "game") return;
      render(<DevPanel client={client} />, $dev);
    });
    render(<DevPanel client={client} />, $dev);
  }
}

export default initTabletopViews;
