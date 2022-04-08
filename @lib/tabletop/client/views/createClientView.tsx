import { ComponentChildren, h } from "preact";
import { memo } from "preact/compat";
import { ErrorReciever } from "@lib/components/ErrorReceiver";

import { TitleProps, GameProps, ViewProps } from "..";

import { Title as DefaultTitle } from "./Title";
import { Lobby as DefaultLobby, LobbyViewProps } from "./Lobby";
import { DebugPanel } from "./DebugPanel";
import { Spec } from "../../spec";
import { Cart } from "../../cart";
import { OptionsView } from "./OptionsView";

export type ClientViewProps<S extends Spec> = {
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyViewProps<S>) => JSX.Element;
  Options?: OptionsView<S>;
  Game: (props: GameProps<S>) => JSX.Element;
};

function AppContainer<S extends Spec>({
  props,
  children,
}: {
  props: ViewProps<S>[1];
  children: ComponentChildren;
}) {
  return (
    <>
      {children}
      <div class="absolute bottom-1 left-1">
        <ErrorReciever err={props.err || null} />
      </div>
    </>
  );
}

export const createClientView = <S extends Spec>(
  cart: Cart<S>,
  {
    Title = DefaultTitle,
    Lobby = DefaultLobby,
    Game,
    Options,
  }: ClientViewProps<S>,
  debug?: boolean
) => {
  // Memoize so meter updates don't affect game itself
  const GameMemo = memo((props: GameProps<S>) => <Game {...props} />);

  return ({ viewProps }: { viewProps: ViewProps<S> }) => {
    const [type, props] = viewProps;
    const { err } = props;

    if (type === "title") {
      return (
        <AppContainer props={props}>
          <Title {...props} />
        </AppContainer>
      );
    }

    if (type === "lobby") {
      const { setOptions } = cart;
      return (
        <AppContainer props={props}>
          <Lobby {...{ ...props, Options, setOptions }} />
        </AppContainer>
      );
    }

    if (type === "game") {
      const gameVnode = (
        <AppContainer props={props}>
          <GameMemo {...props} />
        </AppContainer>
      );

      if (debug) {
        return (
          <section id="root" class="h-full flex">
            <DebugPanel {...props} />
            <section id="game" class="relative h-full flex-grow">
              {gameVnode}
            </section>
          </section>
        );
      } else {
        return gameVnode;
      }
    }

    return null;
  };
};
export default createClientView;
