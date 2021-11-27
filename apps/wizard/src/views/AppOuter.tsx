import type { WizardProps } from "./types";
import { ComponentChildren, FunctionalComponent } from "preact";

import { useCallback, useState } from "preact/hooks";

import { ErrorReciever } from "@lib/components/ErrorReceiver";
import { DialogOf } from "@lib/components/Dialog";

import { AppInner } from "./AppInner";

export type WizardPropsPlus = WizardProps & {
  dialogActions: {
    set: (
      children: ComponentChildren | FunctionalComponent<WizardProps>
    ) => void;
    close: () => void;
  };
};

function useDialog(props: WizardProps) {
  const [Dialog, setDialog] = useState<
    ComponentChildren | FunctionalComponent<WizardProps>
  >(null);
  const set = useCallback(
    (childrenOrComponent: ComponentChildren | FunctionalComponent) =>
      setDialog(
        typeof childrenOrComponent === "function"
          ? () => childrenOrComponent
          : childrenOrComponent
      ),
    []
  );
  const close = useCallback(() => setDialog(null), []);
  return {
    Dialog: (
      <DialogOf close={close}>
        {typeof Dialog === "function" ? <Dialog {...props} /> : Dialog}
      </DialogOf>
    ),
    dialogActions: { set, close },
  };
}

export function AppOuter(props: WizardProps) {
  const { frame } = props;
  const { Dialog, dialogActions } = useDialog(props);

  const { err, connected } = frame;

  if (!connected) return <div style={{ fontSize: "50px" }}>🔌</div>;

  const enhancedProps = { ...props, dialogActions };

  return (
    <>
      {Dialog}
      <AppInner {...enhancedProps} />
      <ErrorReciever err={err} />
    </>
  );
}
