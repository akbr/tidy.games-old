import "@shared/base.css";
import "../styles.css";

import { setup } from "@twind/preact";

import { wizardDefinition } from "./game";
import { Game } from "./views/Game";
import { createServer } from "@lib/tabletop/server";
import { createClient, createControls } from "@lib/tabletop/client";
import { DebugPanel } from "@lib/tabletop/client/debug";
import { createLocalSocket } from "@lib/socket";
import { render } from "preact";

setup({
  props: { className: true },
  preflight: false,
});

const server = createServer(wizardDefinition, { seed: "test" });
const {
  subscribe,
  controls: p0,
  meter,
} = createClient(server, wizardDefinition);

subscribe(([type, props]) => {
  if (type === "game") {
    render(<Game {...props} />, document.getElementById("game")!);
  }
  if (type === "gameEx") {
    render(<DebugPanel {...props} />, document.getElementById("debug")!);
  }
  if (props.err) {
    //console.warn(props.err);
  }
});

p0.server.join({ id: "test" });

const p1 = createControls(createLocalSocket(server), wizardDefinition);
const p2 = createControls(createLocalSocket(server), wizardDefinition);
const p3 = createControls(createLocalSocket(server), wizardDefinition);

p1.server.join({ id: "test" });
p2.server.join({ id: "test" });
p3.server.join({ id: "test" });

p0.server.start(null);

p1.game.bid(1);
p2.game.bid(1);
p3.game.bid(1);
p0.game.bid(0);
p1.game.play("6|h");
p2.game.play("14|s");
p3.game.play("8|h");
p0.game.play("11|h");

meter.controls.setIdx(23);
