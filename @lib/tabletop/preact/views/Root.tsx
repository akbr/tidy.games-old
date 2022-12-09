import { Spec } from "@lib/tabletop/core/spec";
import { useEmitter } from "@lib/emitter";

import { AppProps, ViewInputs } from "../types";

import Notifications from "./Notifications";
import DialogFeeder from "./DialogFeeder";

import { Backdrop as DefaultBackdrop } from "./Backdrop";
import { Title } from "./Title";
import { Lobby } from "./Lobby";

export function Root<S extends Spec>(
  props: { appProps: AppProps<S> } & { viewInputs: ViewInputs<S> }
) {
  const { appProps, viewInputs } = props;

  const mode = useEmitter(appProps.client.emitter, (x) => x.mode);

  const Backdrop = viewInputs.Backdrop || DefaultBackdrop;
  const Game = viewInputs.Game;

  const ModeView = (() => {
    if (mode === "title") return <Title {...props} />;
    if (mode === "lobby") return <Lobby {...props} />;
    if (mode === "game") return <Game {...appProps} />;
  })();

  return (
    <Backdrop {...appProps}>
      {ModeView}
      <Notifications {...appProps} />
      <DialogFeeder {...appProps} />
    </Backdrop>
  );
}

export default Root;
