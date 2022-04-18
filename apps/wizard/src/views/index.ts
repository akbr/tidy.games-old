import type { WizardSpec } from "src/game/spec";
import type { AppViews } from "@shared/components/Tabletop/App";

import { Game } from "./Game";
import { Options } from "./Options";

export const WizardViews: AppViews<WizardSpec> = {
  Game,
  Options,
};

export default WizardViews;
