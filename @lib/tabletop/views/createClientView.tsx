import { h } from "preact";
import { memo } from "preact/compat";

import { Spec } from "../spec";
import { Cart } from "../cart";
import { TitleProps, GameProps, ViewProps } from "../client";

import { AppWrapper } from "./AppWrapper";
import { Title as DefaultTitle } from "./Title";
import { Lobby as DefaultLobby, LobbyViewProps } from "./Lobby";
import { DebugPanel } from "./DebugPanel";
import { OptionsView } from "./OptionsView";

export type ClientViewProps<S extends Spec> = {
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyViewProps<S>) => JSX.Element;
  Options?: OptionsView<S>;
  Game: (props: GameProps<S>) => JSX.Element;
};

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

    if (type === "title") {
      return (
        <AppWrapper props={props}>
          <Title {...props} />
        </AppWrapper>
      );
    }

    if (type === "lobby") {
      const { setOptions } = cart;
      return (
        <AppWrapper props={props}>
          <Lobby {...{ ...props, Options, setOptions }} />
        </AppWrapper>
      );
    }

    if (type === "game") {
      const gameVnode = (
        <AppWrapper props={props}>
          <GameMemo {...props} />
        </AppWrapper>
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
