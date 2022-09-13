import { Spec } from "../core";
import { DialogOf } from "./DialogOf";
import { AppProps } from "./App";
import { Props } from "./types";
import { useSubscribable } from "@lib/subscribable";

export function DialogFeeder<S extends Spec>(
  props: Props<S> & {
    dialogStore: AppProps<S>["dialogStore"];
  }
) {
  const { dialogStore, setDialog } = props;
  const Dialog = useSubscribable(dialogStore, (x) => x);

  if (!Dialog) return null;

  return (
    <DialogOf close={() => setDialog(null)}>
      <Dialog {...props} />
    </DialogOf>
  );
}

export default DialogFeeder;
