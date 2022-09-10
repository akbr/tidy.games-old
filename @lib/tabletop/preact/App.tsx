import { ComponentChildren, h } from "preact";

import { Spec } from "@lib/tabletop/core/spec";
import { Client } from "@lib/tabletop/client/";
import useSubscribe from "@lib/store/useSubscribe";

import type { TitleProps, LobbyProps, GameProps } from "./types";
import DefaultBackrop from "./Backdrop";
import DefaultAppContainer from "./Container";
import { NotificationsWrapper } from "./NotificationsWrapper";
import DefaultTitle from "./Title";
import DefaultLobby from "./Lobby";
import DefaultGame from "./Game";
import { useRefreshOnResize } from "@lib/hooks";

export type AppViews<S extends Spec> = {
  Backdrop?: (props: { children: ComponentChildren }) => JSX.Element;
  AppContainer?: (props: { children: ComponentChildren }) => JSX.Element;
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyProps<S>) => JSX.Element;
  Game?: (props: GameProps<S>) => JSX.Element;
  Side?: (props: GameProps<S>) => JSX.Element;
};

export function App<S extends Spec>({
  client,
  views,
}: {
  client: Client<S>;
  views: AppViews<S>;
}) {
  const {
    Backdrop = DefaultBackrop,
    AppContainer = DefaultAppContainer,
    Title = DefaultTitle,
    Lobby = DefaultLobby,
    Game = DefaultGame,
  } = views;

  const props = useSubscribe(client, (x) => ({ ...x, ...client }));

  return (
    <Backdrop>
      <AppContainer>
        <NotificationsWrapper client={client}>
          {props.view === "title" && <Title {...props} />}
          {props.view === "lobby" && <Lobby {...props} />}
          {props.view === "game" && <Game {...props} />}
        </NotificationsWrapper>
      </AppContainer>
      {props.view === "game" && views.Side && (
        <SideWrapper props={props} SideView={views.Side} />
      )}
    </Backdrop>
  );
}

function SideWrapper<S extends Spec>({
  props,
  SideView,
}: {
  props: GameProps<S>;
  SideView: NonNullable<AppViews<S>["Side"]>;
}) {
  useRefreshOnResize();
  const { width } = document.body.getBoundingClientRect();
  return width > 1200 ? (
    <div class="flex justify-center items-center p-6">
      <SideView {...props} />
    </div>
  ) : null;
}

export default App;
