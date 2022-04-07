import { init } from "@shared/clientInit";

import { wizardCart } from "./game";
import { Game } from "./views/Game";
import { Options } from "./views/Options";

const client = init(
  wizardCart,
  document.getElementById("app")!,
  { Game, Options },
  { seed: "test113" }
);

client.controls.server.join({ id: "test" });
