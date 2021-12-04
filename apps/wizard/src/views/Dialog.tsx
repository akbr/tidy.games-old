import { DialogContainerProps } from "./types";
import { DialogOf } from "@lib/components/Dialog";

export const Dialog = ({
  dialog,
  state,
  room,
  actions,
}: DialogContainerProps) => {
  if (typeof dialog === "function") {
    const Dialog = dialog;
    return (
      <DialogOf close={() => actions.setDialog(null)}>
        <Dialog state={state} room={room} actions={actions} />
      </DialogOf>
    );
  }
  return <DialogOf close={() => actions.setDialog(null)}>{dialog}</DialogOf>;
};
