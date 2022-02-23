import "@shared/base.css";
import "../styles.css";

import { setup } from "@twind/preact";

import { wizardDefinition } from "./game";
import { createServer } from "@lib/tabletop/server";
import { createClient } from "@lib/tabletop/client";
import { createLocalSocket } from "@lib/socket";

setup({
  props: { className: true },
  preflight: false,
});

const server = createServer(wizardDefinition);
const { subscribe, meter, actions, serverActions } = createClient(
  server,
  wizardDefinition
);

subscribe(([type, props]) => {
  if (type === "title") {
    console.log("<<< WIZARD >>>");
  } else if (type === "lobby") {
    console.log(props.room);
  } else if (type === "game") {
    console.log(props.state);
  }
});

serverActions.join({ id: "test" });

const p1 = createLocalSocket(server, {});
p1.send(["server", { type: "join", data: { id: "test" } }]);

serverActions.start(null);
p1.send(["machine", { type: "bid", data: 1 }]);
