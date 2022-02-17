import {
  createAppScaffolding,
  ServerState,
  StoreState,
} from "@lib/client-setup/";
import { DialogProps as DialogPropsType } from "@lib/client-setup/extensions/dialog";
import { WizardShape } from "../engine/types";
import { createActions } from "../createActions";

//@ts-ignore
const wrapper = () => createAppScaffolding<WizardShape>();

type StdActions = ReturnType<typeof wrapper>["actions"];
type WizardActions = ReturnType<typeof createActions>;
type Actions = StdActions & WizardActions;

export type AppProps = Omit<StoreState<WizardShape>, "err" | "dialog"> & {
  actions: Actions;
};
export type DialogContainerProps = Omit<StoreState<WizardShape>, "err"> & {
  actions: Actions;
};
export type ErrProps = Pick<ServerState<WizardShape>, "err">;
export type DialogProps = DialogPropsType<WizardShape>;
