import { FunctionalComponent, h } from "preact";
import { memo } from "preact/compat";
import { ErrorReciever } from "@lib/components/ErrorReceiver";
import { Spec } from "../types";

import { TitleProps, LobbyProps, GameProps, ViewProps } from "./";
import { DebugPanel } from "./debug";

export type ClientViewProps<S extends Spec> = {
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyProps<S>) => JSX.Element;
  Game: (props: GameProps<S>) => JSX.Element;
  debug?: boolean;
};

export const createClientView = <S extends Spec>({
  Title = () => <div>Title</div>,
  Lobby = ({ room }) => (
    <div>
      <h1>Lobby</h1>
      <div>{JSON.stringify(room)}</div>
    </div>
  ),
  Game,
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
          <Lobby {...props} />
        </Interface>
      );
    }

    if (type === "game") {
      const { meter, ...gameProps } = props;

      if (debug) {
        return (
          <section id="root" style="height: 100%; width: 100%; display: flex">
            <section style="height: 100%" id="debug">
              <DebugPanel {...props} />
            </section>
            <section
              class="relative"
              style="height: 100%; flex-grow: 1"
              id="game"
            >
              <Interface props={props}>
                <GameMemo {...gameProps} />
              </Interface>
            </section>
          </section>
        );
      } else {
        return (
          <Interface props={props}>
            <GameMemo {...gameProps} />
          </Interface>
        );
      }
    }

    return null;
  };
};
