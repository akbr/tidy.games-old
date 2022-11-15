import { render } from "preact";
import { DevWrapper } from "@lib/meter/preact";
import { createEmitter } from "@lib/emitter";

import type { Spec } from "../core";
import type { Client } from "../client";
import type { AppProps, AppViews, DialogView, SetDialog } from "./types";

import { StateDisplay } from "./views/StateDisplay";
import { Root } from "./views/Root";

export function createViewManager<S extends Spec>(client: Client<S>) {
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

  function setViews(
    $el: HTMLElement,
    views: AppViews<S>,
    options = { dev: false }
  ) {
    const rootProps = { ...appProps, views };

    let vdom = options.dev ? (
      <DevWrapper meter={client.gameMeter} stateDisplay={StateDisplay}>
        <Root {...rootProps} />
      </DevWrapper>
    ) : (
      <Root {...rootProps} />
    );

    render(vdom, $el);
  }

  return {
    dialogEmitter,
    setDialog,
    setViews,
  };
}

export default createViewManager;
