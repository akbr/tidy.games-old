import { Spec } from "@lib/tabletop/core/spec";
import { useEmitter } from "@lib/emitter";

import { AppProps, AppViews } from "../types";

import DefaultBackrop from "./Backdrop";
import DefaultAppContainer from "./Container";
import DefaultTitle from "./Title";
import DefaultLobby from "./Lobby";
import DefaultGame from "./Game";
import Notifications from "./Notifications";
import DialogFeeder from "./DialogFeeder";

export function Root<S extends Spec>(
  props: AppProps<S> & { views: AppViews<S> }
) {
  const { views, ...appProps } = props;
  const { Backdrop = DefaultBackrop, AppContainer = DefaultAppContainer } =
    views;

  return (
    <Backdrop {...appProps}>
      <AppContainer {...appProps}>
        <ModeSwitcher {...props} />
        <Notifications {...appProps} />
        <DialogFeeder {...appProps} />
      </AppContainer>
    </Backdrop>
  );
}
export default Root;

function ModeSwitcher<S extends Spec>(
  props: AppProps<S> & { views: AppViews<S> }
) {
  const mode = useEmitter(props.client.appEmitter, (x) => x.mode);

  const {
    Title = DefaultTitle,
    Lobby = DefaultLobby,
    Game = DefaultGame,
  } = props.views;

  return (
    <>
      {mode === "title" && <Title {...props} />}
      {mode === "lobby" && <Lobby {...props} />}
      {mode === "game" && <Game {...props} />}
    </>
  );
}
