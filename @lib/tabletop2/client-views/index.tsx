import { FunctionalComponent, h } from "preact";
import { memo } from "preact/compat";
import { ErrorReciever } from "@lib/components/ErrorReceiver";

import { TitleProps, LobbyProps, GameProps, ViewProps } from "../client";

import { Title as DefaultTitle } from "./Title";
import { Lobby as DefaultLobby } from "./Lobby";
import { DebugPanel } from "./DebugPanel";
import { Spec } from "../spec";

export type OptionsView<S extends Spec> = (props: {
  set?: () => void;
}) => JSX.Element;

export type ClientViewProps<S extends Spec> = {
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyProps<S> & { Options?: OptionsView<S> }) => JSX.Element;
  Options?: OptionsView<S>;
  Game: (props: GameProps<S>) => JSX.Element;
  debug?: boolean;
};

export const createClientView = <S extends Spec>({
  Title = DefaultTitle,
  Lobby = DefaultLobby,
  Game,
  Options,
  debug = false,
}: ClientViewProps<S>) => {
  const Interface: FunctionalComponent<{ props: ViewProps<S>[1] }> = ({
    children,
    props,
  }) => {
    return (
      <>
        {children}
        <div class="absolute bottom-1 left-1">
          <ErrorReciever err={props.err || null} />
        </div>
      </>
    );
  };

  // Memoize so meter updates don't affect game itself
  const GameMemo = memo((props: GameProps<S>) => <Game {...props} />);

  return ({ viewProps }: { viewProps: ViewProps<S> }) => {
    const [type, props] = viewProps;
    const { err } = props;

    if (type === "title") {
      return (
        <Interface props={props}>
          <Title {...props} />
        </Interface>
      );
    }

    if (type === "lobby") {
      return (
        <Interface props={props}>
          <Lobby {...{ ...props, Options }} />
        </Interface>
      );
    }

    if (type === "game") {
      const { meter, ...gameProps } = props;
      const gameVnode = (
        <Interface props={props}>
          <GameMemo {...gameProps} />
        </Interface>
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
