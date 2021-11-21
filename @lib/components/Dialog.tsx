import { styled } from "goober";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { Button } from "./common";

const Core = styled("div")`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 999;
`;

const Backdrop = styled(Core)`
  background-color: rgba(0, 0, 0, var(--backdrop-opacity));
`;

const DialogWrapper = styled(Core)`
  display: grid;
  place-items: center;
  margin-top: -5em;
`;

type DialogHolderProps = {
  close: () => void;
  children?: ComponentChildren;
  visible: boolean;
};

const WithPrevChild = ({ children }: { children: ComponentChildren }) => {
  const [prevChild, setPrevChild] = useState<ComponentChildren>(null);

  if (children === null) {
    return <>{prevChild}</>;
  } else {
    setPrevChild(children);
    return <>{children}</>;
  }
};

export const DialogHolder = ({
  close,
  children,
  visible,
}: DialogHolderProps) => {
  return (
    <>
      <Backdrop
        onClick={close}
        style={{
          "--backdrop-opacity": visible ? 0.5 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "background-color 200ms",
        }}
      ></Backdrop>
      <DialogWrapper
        style={{
          pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms",
        }}
      >
        <div style={{ pointerEvents: visible ? "initial" : "none" }}>
          {children}
        </div>
      </DialogWrapper>
    </>
  );
};

const Container = styled("div")`
  position: relative;
  display: inline-block;
  background-color: lightblue;
  min-width: 200px;
  min-height: 100px;
  border-radius: 6px;
  padding: 10px;
  color: black;
`;

const Closer = styled(Button)`
  position: absolute;
  bottom: 90%;
  left: 90%;
  padding: 10px;
  border-radius: 10px;
`;

type DialogInnerProps = {
  close: () => void;
  children?: ComponentChildren;
};

export const DialogInner = ({ children, close }: DialogInnerProps) => {
  return (
    <Container>
      <Closer onClick={close}>X</Closer>
      {children}
    </Container>
  );
};

export function DialogOf({
  close,
  children,
}: {
  close: () => void;
  children: ComponentChildren;
}) {
  const visible = children !== null;

  return (
    <DialogHolder close={close} visible={visible}>
      <DialogInner close={close}>
        <WithPrevChild>{children}</WithPrevChild>
      </DialogInner>
    </DialogHolder>
  );
}
