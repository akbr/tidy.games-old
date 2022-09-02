import { ComponentChildren, h } from "preact";

import { Spec } from "@lib/tabletop/core/spec";
import { Client } from "@lib/tabletop/client/";
import useSubscribe from "@lib/store/useSubscribe";

import type { TitleProps, LobbyProps, GameProps } from "./types";
import DefaultBackrop from "./Backdrop";
import DefaultAppContainer from "./Container";
import NotificationsWrapper from "./NotificationsWrapper";
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

  return (
    <Backdrop>
      <AppContainer>
        <NotificationsWrapper client={client}>
          <TitleFeeder client={client} View={Title} />
          <LobbyFeeder client={client} View={Lobby} />
          <GameFeeder client={client} View={Game} />
        </NotificationsWrapper>
      </AppContainer>
      {views.Side && <SideFeeder client={client} View={views.Side} />}
    </Backdrop>
  );
}

function TitleFeeder<S extends Spec>({
  client,
  View,
}: {
  client: Client<S>;
  View: NonNullable<AppViews<S>["Title"]>;
}) {
  const [room, connected] = useSubscribe(client, (c) => [c.room, c.connected]);
  if (room) return null;

  const { cart, actions } = client;
  return (
    <View
      connected={connected}
      meta={cart.meta}
      actions={{ join: actions.server.join }}
    />
  );
}

function LobbyFeeder<S extends Spec>({
  client,
  View,
}: {
  client: Client<S>;
  View: NonNullable<AppViews<S>["Lobby"]>;
}) {
  const [room, state] = useSubscribe(client, (c) => [c.room, c.state]);
  if (!room || state) return null;

  const { start, leave, setMeta, addBot } = client.actions.server;
  const actions = {
    start,
    leave,
    setMeta,
    addBot: client.cart.botFn ? addBot : undefined,
  };

  return <View cart={client.cart} room={room} actions={actions} />;
}

function GameFeeder<S extends Spec>({
  client,
  View,
}: {
  client: Client<S>;
  View: NonNullable<AppViews<S>["Game"]>;
}) {
  const { room, state, action, ctx } = useSubscribe(client, (c) => c);
  if (!room || !state || !ctx) return null;
  return (
    <View
      meta={client.cart.meta}
      ctx={ctx}
      room={room}
      state={state}
      action={action}
      actions={client.actions}
    />
  );
}

function SideFeeder<S extends Spec>({
  client,
  View,
}: {
  client: Client<S>;
  View: NonNullable<AppViews<S>["Side"]>;
}) {
  useRefreshOnResize();
  const { width } = document.body.getBoundingClientRect();
  return width > 1200 ? (
    <div class="flex justify-center items-center p-6">
      <GameFeeder client={client} View={View} />
    </div>
  ) : null;
}

export default App;
