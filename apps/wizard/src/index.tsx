import "@shared/base.css";
import "../styles.css";

import { h, render } from "preact";
import { setup } from "@twind/preact";

import { createServer } from "@lib/tabletop/server";
import { createClient } from "@lib/tabletop/client";
import { createClientView } from "@lib/tabletop/client/View";

import { wizardDefinition } from "./game";
import { Game } from "./views/Game";

setup({
  props: { className: true },
  preflight: false,
});

const server = createServer(wizardDefinition, { seed: "test113" });
const client = createClient(server, wizardDefinition);
const View = createClientView({ Game, debug: true });

client.subscribe((x) =>
  render(h(View, { viewProps: x }, null), document.getElementById("app")!)
);
client.update();

const { controls } = client;
controls.server.join({ id: "TEST" });
controls.server.addBot(null);
controls.server.start(null);
controls.meter.setIdx(2);
