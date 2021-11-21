import { WizardShape } from "../engine/types";
import { Actions } from "../actions";
import { Frame } from "@lib/socket-server-interface/types";

export type WizardProps = {
  frame: Frame<WizardShape>;
  prevFrame: Frame<WizardShape> | undefined;
  actions: Actions;
};

export type Player = { avatar: string; name: string; active: boolean };
