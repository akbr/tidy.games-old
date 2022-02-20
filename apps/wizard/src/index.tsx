import { setup } from "@twind/preact";

import { mount } from "@lib/tabletop/mount";
import { wizardDefinition } from "./game";
import { Game } from "./views/Game";

setup({
  props: { className: true },
  preflight: false,
});

const { machine, actions } = mount(
  wizardDefinition,
  {
    ctx: {
      numPlayers: 4,
      options: null,
      seed: "test",
    },
  },
  document.getElementById("app")!,
  Game
);

actions.bid(1, 1);
actions.bid(2, 1);
actions.bid(3, 1);
actions.bid(0, 1);
actions.play(1, "6|h");
actions.play(2, "14|s");
actions.play(3, "8|h");
actions.play(0, "11|h");
