import { FunctionalComponent } from "preact";

import { Subscribable } from "@lib/store";
import { Spec } from "@lib/tabletop/core/spec";
import { Client } from "@lib/tabletop/client/";
import { useSubscribe } from "@lib/store/useSubscribe";

import type {
  TitleProps,
  LobbyProps,
  GameProps,
  DialogView,
  SetDialog,
} from "./types";

import DefaultBackrop from "./Backdrop";
import DefaultAppContainer from "./Container";
import DefaultTitle from "./Title";
import DefaultLobby from "./Lobby";
import DefaultGame from "./Game";
import { NotificationsWrapper } from "./NotificationsWrapper";
import { SideWrapper } from "./SideWrapper";
import DialogFeeder from "./DialogFeeder";

export type AppViews<S extends Spec> = {
  Backdrop?: FunctionalComponent;
  AppContainer?: FunctionalComponent;
  Title?: FunctionalComponent<TitleProps<S>>;
  Lobby?: FunctionalComponent<LobbyProps<S>>;
  Game?: FunctionalComponent<GameProps<S>>;
  Side?: FunctionalComponent<GameProps<S>>;
};

export type AppProps<S extends Spec> = {
  client: Client<S>;
  dialogStore: Subscribable<DialogView<S> | null>;
  setDialog: SetDialog<S>;
  views: AppViews<S>;
};

export function App<S extends Spec>({
  client,
  dialogStore,
  setDialog,
  views,
}: AppProps<S>) {
  const {
    Backdrop = DefaultBackrop,
    AppContainer = DefaultAppContainer,
    Title = DefaultTitle,
    Lobby = DefaultLobby,
    Game = DefaultGame,
  } = views;

  const props = useSubscribe(client, (x) => ({ ...x, ...client, setDialog }));

  return (
    <Backdrop>
      <AppContainer>
        <NotificationsWrapper client={client}>
          {props.view === "title" && <Title {...props} />}
          {props.view === "lobby" && <Lobby {...props} />}
          {props.view === "game" && <Game {...props} />}
        </NotificationsWrapper>
        <DialogFeeder {...{ ...props, dialogStore }} />
      </AppContainer>
      {props.view === "game" && views.Side && (
        <SideWrapper props={props} SideView={views.Side} />
      )}
    </Backdrop>
  );
}
