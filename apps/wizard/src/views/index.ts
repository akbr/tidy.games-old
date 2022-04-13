import type { WizardSpec } from "src/game/spec";
import type { ClientViewProps } from "@shared/components/Tabletop";

import { Game } from "./Game";
import { Options } from "./Options";

export const WizardViews: ClientViewProps<WizardSpec> = {
  Game,
  Options,
};
export default WizardViews;
