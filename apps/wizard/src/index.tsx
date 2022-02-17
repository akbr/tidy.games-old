import { setup } from "@twind/preact";

import { createDebugView } from "@lib/tabletop/debug";
import { wizardDefinition } from "./game";
import { Game } from "./views/Game";

setup({
  props: { className: true },
  preflight: false,
});

createDebugView(
  wizardDefinition,
  {
    ctx: {
      numPlayers: 2,
      options: null,
      seed: "test",
    },
  },
  document.getElementById("app")!,
  Game
);
