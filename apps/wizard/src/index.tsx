import "@shared/base.css";
import "../styles.css";

import { setup } from "@twind/preact";

import { wizardDefinition, WizardSpec } from "./game";
import { Game } from "./views/Game";
import { createServer, ClientSocket } from "@lib/tabletop/server";
import { createClient, createControls } from "@lib/tabletop/client";
import { DebugPanel } from "@lib/tabletop/client/debug";
import { createLocalSocket } from "@lib/socket";
import { render } from "preact";
import {
  ConnectedActions,
  Frame,
  getFrames,
} from "@lib/tabletop/client/helpers";
import { GameDefinition, Spec } from "@lib/tabletop/types";
import { getPlayableCards } from "./game/logic";

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

type Bot<S extends Spec> = (
  frame: Frame<S>,
  actions: ConnectedActions<S["actions"]>
) => void;

const createBotSocket = <S extends Spec>(
  socket: ClientSocket<S>,
  def: GameDefinition<S>,
  botFn: Bot<S>
) => {
  const actions = createControls(socket, def);
  socket.onmessage = ([type, payload]) => {
    if (type !== "machine") return;
    getFrames(payload).forEach((frame) => botFn(frame, actions.game));
  };
};

const bot: Bot<WizardSpec> = (
  { state: [type, game], player },
  { bid, select, play }
) => {
  if (player !== game.player) return;
  if (type === "select") {
    return select("h");
  }
  if (type === "bid") {
    return bid(0);
  }
  if (type === "play") {
    const [card] = getPlayableCards(game.hands[player], game.trick);
    return play(card);
  }
};
