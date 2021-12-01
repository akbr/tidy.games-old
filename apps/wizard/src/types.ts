import { WizardShape } from "./engine/types";
import { Actions } from "./createActions";
import { ServerState, StoreState } from "@lib/client-setup/";

export type AppProps = Omit<ServerState<WizardShape>, "err"> & {
  actions: Actions;
};
export type ErrProps = Pick<ServerState<WizardShape>, "err">;
export type DialogProps = Pick<StoreState<WizardShape>, "state" | "dialog"> & {
  actions: Actions;
};
