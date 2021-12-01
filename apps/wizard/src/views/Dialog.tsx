import type { FunctionalComponent } from "preact";
import { DialogProps } from "../types";
import { DialogOf } from "@lib/components/Dialog";

const Dialog = ({ dialog, state, actions }: DialogProps) => {
  if (typeof dialog === "function") {
    const Dialog = dialog;
    return <Dialog state={state} setDialog={actions.setDialog} />;
  }

  return <>{dialog}</>;
};
