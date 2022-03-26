import { init } from "@shared/clientInit";

import { wizardDefinition } from "./game";
import { Game } from "./views/Game";
import { Options } from "./views/Options";

const client = init(
  wizardDefinition,
  document.getElementById("app")!,
  { Game, Options }
  //{ seed: "test113" }
);
