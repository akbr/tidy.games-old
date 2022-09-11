import { render } from "preact";
import { DevWrapper } from "@lib/meter/preact";
import { setReceiver } from "@lib/globalUi";
import { Spec } from "../core";
import { Client } from "../client";
import { DialogView, SetDialog } from "./types";
import { StateDisplay } from "./StateDisplay";
import { App, AppViews } from "./App";
import { createSubscription } from "@lib/store";

export function createViews<S extends Spec>(
  client: Client<S>,
  $el: HTMLElement,
  views: AppViews<S>,
  options = { dev: false }
) {
  // Configure waitFor global relay for animations
  setReceiver(client.meter.actions.waitFor);

  // Create a global dialog store & helper
  const dialogStore = createSubscription<DialogView<S> | null>(null);
  const setDialog: SetDialog<S> = (x) => {
    //@ts-ignore
    dialogStore.next(() => x);
  };

  // Create application vdom
  let vdom = (
    <App
      client={client}
      dialogStore={dialogStore}
      setDialog={setDialog}
      views={views}
    />
  );

  // Create development environment
  if (options.dev) {
    client.meter.actions.setHistory(true);
    vdom = (
      <DevWrapper meter={client.meter} stateDisplay={StateDisplay}>
        {vdom}
      </DevWrapper>
    );
  }

  render(vdom, $el);
}

export default createViews;
