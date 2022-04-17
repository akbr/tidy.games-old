import type { WizardSpec } from "src/game/spec";
import type { ClientViews } from "@shared/components/Tabletop";

import { Game } from "./Game";
import { Options } from "./Options";

export const WizardViews: ClientViews<WizardSpec> = {
  Game,
  Options,
};
export default WizardViews;
