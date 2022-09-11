import { Spec } from "../core";
import { DialogOf } from "./DialogOf";
import { AppProps } from "./App";
import { Props } from "./types";
import { useSubscribe } from "@lib/store";

export function DialogFeeder<S extends Spec>(
  props: Props<S> & {
    dialogStore: AppProps<S>["dialogStore"];
  }
) {
  const { dialogStore, setDialog } = props;
  const Dialog = useSubscribe(dialogStore, (x) => x);

  if (!Dialog) return null;

  return (
    <DialogOf close={() => setDialog(null)}>
      <Dialog {...props} />
    </DialogOf>
  );
}

export default DialogFeeder;
