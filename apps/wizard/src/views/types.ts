import type { AppState as _AppState } from "@shared/components/Tabletop/App";
import type { WizardSpec } from "../game/spec";

export type AppState = { state: _AppState<WizardSpec> };
export type GameProps = Extract<_AppState<WizardSpec>, { 0: "game" }>[1];
