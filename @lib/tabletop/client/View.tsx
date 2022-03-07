import { memo } from "preact/compat";
import { Spec } from "../types";
import { TitleProps, LobbyProps, GamePropsLight, ViewProps } from "./";
import { DebugPanel } from "./debug";

export type ClientViewProps<S extends Spec> = {
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyProps<S>) => JSX.Element;
  Game: (props: GamePropsLight<S>) => JSX.Element;
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
  // Memoize game, b/c "game" props often updates with meter
  Game = memo(Game);

  return ({ viewProps }: { viewProps: ViewProps<S> }) => {
    const [type, data] = viewProps;
    if (type === "title") {
      return <Title {...data} />;
    }

    if (type === "lobby") {
      return <Lobby {...data} />;
    }

    if (type === "game") {
      const { meter, ...rest } = data;
      if (debug) {
        return (
          <section id="root" style="height: 100%; width: 100%; display: flex">
            <section style="height: 100%" id="debug">
              <DebugPanel {...data} />
            </section>
            <section style="height: 100%; flex-grow: 1" id="game">
              <Game {...rest} />
            </section>
          </section>
        );
      } else {
        return <Game {...rest} />;
      }
    }

    return null;
  };
};
