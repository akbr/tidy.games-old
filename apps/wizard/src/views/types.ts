import { WizardShape } from "../engine/types";
import { Actions } from "../createActions";
import {
  ServerSlice,
  DialogSlice,
} from "@lib/socket-server-interface/storeSlices";

export type AppProps = Omit<ServerSlice<WizardShape>, "err"> & {
  actions: Actions;
};

export type ErrorsProps = Pick<ServerSlice<WizardShape>, "err">;

export type DialogProps = DialogSlice<AppProps>;

export type Player = { avatar: string; name: string; active: boolean };
