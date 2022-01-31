import { Engine, EngineTypes } from "@lib/engine";
import { createServer } from "@lib/io/server";
import { createClient, ActionStubs } from "@lib/io/client";

export function proto<ET extends EngineTypes>(
  engine: Engine<ET>,
  actionStubs: ActionStubs<ET["actions"]>,
  delay = 250
) {
  const server = createServer(engine);
  const clients = Array.from({ length: 6 }).map(() =>
    createClient(server, actionStubs)
  );

  const client = clients[0];
  const { store, meter } = client;

  store.subscribeWithSelector(
    ({ server }) => server,
    (server) => {
      if (server === null) return;
      console.log(
        `%c SERVER ` + `%c ${JSON.stringify(server)}`,
        "background: green; color: white; font-weight: bold",
        ""
      );
    }
  );

  store.subscribeWithSelector(
    ({ frame }) => frame,
    (frame) => {
      if (frame === null) return;
      console.log(
        `%c FRAME ` +
          `%c ${frame.state.type}` +
          `%c ${JSON.stringify(frame.state.data)}` +
          ` ${JSON.stringify(frame.action)}`,
        "background: purple; color: white; font-weight: bold",
        "background: #222; color: white; font-weight: bold",
        ""
      );
      meter.wait(delay);
    }
  );

  store.subscribeWithSelector(
    ({ msg }) => msg,
    (msg) => {
      if (!msg) return;
      console.log(
        `%c ERR ` + `%c ${JSON.stringify(msg)}`,
        "background: red; color: white; font-weight: bold",
        ""
      );
    }
  );

  const s = clients.map((client) => ({
    ...client.actions.server,
    ...client.actions.engine,
    getFrame: () => client.store.get().frame,
  }));

  return s;
}
