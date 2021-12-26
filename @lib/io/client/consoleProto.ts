import { ActionStubs, Engine, EngineTypes } from "@lib/io/engine";
import { createServer } from "@lib/io/server";
import { createClient } from "@lib/io/client";

export function consoleProto<ET extends EngineTypes>(
  engine: Engine<ET>,
  actionStubs: ActionStubs<ET["actionGlossary"]>
) {
  const server = createServer(engine);
  const clients = Array.from({ length: 6 }).map(() =>
    createClient(server, actionStubs)
  );

  const client = clients[0];

  client.store.subscribe(
    (x) => x.server,
    (server) =>
      console.log(
        `%c SERVER ` + `%c ${JSON.stringify(server)}`,
        "background: green; color: white; font-weight: bold",
        ""
      )
  );

  client.store.subscribe(
    (x) => x.state,
    (state, prev) => {
      if (state === null) return;
      console.log(
        `%c STATE ` + `%c ${state.type}` + `%c ${JSON.stringify(state.data)}`,
        "background: purple; color: white; font-weight: bold",
        "background: #222; color: white; font-weight: bold",
        ""
      );
      client.meter.waitFor(250);
    }
  );

  client.store.subscribe(
    (x) => x.msg,
    (msg) =>
      console.log(
        `%c ERR ` + `%c ${JSON.stringify(msg!.data)}`,
        "background: red; color: white; font-weight: bold",
        ""
      )
  );

  client.store.subscribe(
    (x) => x.meter,
    (meter) =>
      console.log(
        `%c METER ` + `%c ${meter}`,
        "background: blue; color: white; font-weight: bold",
        ""
      )
  );

  const s = clients.map((client) => ({
    ...client.actions.server,
    ...client.actions.engine,
    getState: () => client.store.get().state,
  }));

  //@ts-ignore
  window.s = s;

  return s;
}
