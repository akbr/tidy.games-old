import { init } from "@shared/clientInit";

import { wizardDefinition } from "./game";
import { Game } from "./views/Game";

const client = init(
  wizardDefinition,
  document.getElementById("app")!,
  { Game }
  //{ seed: "test113" }
);
