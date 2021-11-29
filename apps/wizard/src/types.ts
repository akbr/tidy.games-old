import { WizardShape } from "./engine/types";
import { Actions } from "./createActions";
import {
  ServerSlice,
  DialogSlice as DialogSliceTemplate,
} from "@lib/socket-server-interface/storeSlices";

export type StoreShape = AppSlice & DialogSlice;
export type AppSlice = ServerSlice<WizardShape>;
export type DialogSlice = DialogSliceTemplate<AppProps>;

export type AppProps = Omit<ServerSlice<WizardShape>, "err"> & {
  actions: Actions;
};
export type ErrorsProps = Pick<ServerSlice<WizardShape>, "err">;
export type DialogProps = DialogSlice;
