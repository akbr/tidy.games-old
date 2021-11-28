import { WizardShape } from "../engine/types";
import { Actions } from "../createActions";
import { Frame } from "@lib/socket-server-interface/createStore";

export type WizardProps = {
  frame: Frame<WizardShape>;
  prevFrame: Frame<WizardShape> | undefined;
  actions: Actions;
};

export type Player = { avatar: string; name: string; active: boolean };
