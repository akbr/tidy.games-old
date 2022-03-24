import { init } from "@shared/clientInit";

import { wizardDefinition } from "./game";
import { Game } from "./views/Game";

const client = init(
  wizardDefinition,
  document.getElementById("app")!,
  { Game }
  //{ seed: "test113" }
);

function dev() {
  window.location.hash = "";

  const { controls } = client;
  controls.server.join();
  controls.server.addBot();
  controls.server.addBot();
  controls.server.addBot();
  controls.server.addBot();
  controls.server.addBot();
  controls.server.start();
}

dev();
