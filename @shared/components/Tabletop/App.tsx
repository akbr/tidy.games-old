import { ComponentChildren, h } from "preact";
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "preact/hooks";
import { memo } from "preact/compat";

import { Cart } from "@lib/tabletop/cart";
import { Spec } from "@lib/tabletop/spec";
import { ClientState, GameProps, TitleProps } from "@lib/tabletop/client";

import { Title as DefaultTitle } from "./Title";
import { Lobby as DefaultLobby, LobbyViewProps } from "./Lobby";
import { DebugPanel } from "./DebugPanel";
import { OptionsView } from "./OptionsView";

export type ClientViews<S extends Spec> = {
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyViewProps<S>) => JSX.Element;
  Options?: OptionsView<S>;
  Game: (props: GameProps<S>) => JSX.Element;
};

export type ClientViewProps<S extends Spec> = {
  cart: Cart<S>;
  views: ClientViews<S>;
  debug: boolean;
};

export function createAppView<S extends Spec>({
  cart,
  debug,
  views,
}: ClientViewProps<S>) {
  const { Title = DefaultTitle, Lobby = DefaultLobby, Game, Options } = views;

  // Memoize so meter updates don't affect game itself
  const GameMemo = memo((props: GameProps<S>) => <Game {...props} />);

  function Wrapper({
    props,
    children,
  }: {
    children: ComponentChildren;
    props: ClientState<S>[1];
  }) {
    return (
      <Backdrop>
        <AppContainer>
          <NotificationsWrapper {...props}>{children}</NotificationsWrapper>
        </AppContainer>
      </Backdrop>
    );
  }

  return function AppView({ clientState }: { clientState: ClientState<S> }) {
    const [type, props] = clientState;

    const InnerView = (() => {
      if (type === "title") {
        return <Title {...props} />;
      }

      if (type === "lobby") {
        const { setOptions } = cart;
        return <Lobby {...{ ...props, Options, setOptions }} />;
      }

      if (type === "game") {
        return <GameMemo {...props} />;
      }
    })();

    //<DebugPanel {...props} />

    return (
      <section type="Root" class="h-full w-full flex">
        <section type="Game" class="relative h-full flex-grow">
          <Wrapper props={props}>{InnerView}</Wrapper>
        </section>
      </section>
    );
  };
}

export default createAppView;

function Backdrop({ children }: { children: ComponentChildren }) {
  return (
    <section type="Backdrop" class="h-full flex justify-center bg-[#2a1b0e]">
      {children}
    </section>
  );
}

function AppContainer({ children }: { children: ComponentChildren }) {
  return (
    <section
      type="AppContainer"
      class="h-full w-full max-w-[650px]"
      style={{
        background: "radial-gradient(circle,#00850b 20%,#005c09 100%)",
      }}
    >
      {children}
    </section>
  );
}

export function NotificationsWrapper<S extends Spec>({
  connected,
  children,
  err,
}: ClientState<S>[1] & { children: ComponentChildren }) {
  return (
    <>
      {children}
      <div class="absolute bottom-2 left-2">
        <ErrorReciever err={err || null} />
        <ConnectionWarning connected={connected} />
      </div>
    </>
  );
}

function ConnectionWarning({ connected }: { connected: boolean }) {
  const [show, setShow] = useState(false);
  const timerId = useRef<any>();

  useEffect(() => {
    if (!connected) {
      timerId.current = setTimeout(() => {
        setShow(true);
      }, 2000);
    } else {
      clearTimeout(timerId.current);
      setShow(false);
    }
  }, [connected]);

  return show ? (
    <div class="inline-block bg-yellow-600 p-2 rounded-lg text-white">
      WebSocket not connected.{" "}
      <button onClick={() => location.reload()}>Reload 🔄</button>
    </div>
  ) : null;
}

type Err = { type: string; data: string };

const TimedError = ({
  err,
  remove,
}: {
  err: Err;
  remove: (err: Err) => void;
}) => {
  useLayoutEffect(() => {
    let timeout = setTimeout(() => {
      remove(err);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [err]);

  return (
    <div class="inline-block bg-red-600 p-2 rounded-lg text-white">
      {err.data}
    </div>
  );
};

export const ErrorReciever = ({ err }: { err: Err | null }) => {
  const [errors, setErrors] = useState<Err[]>([]);

  const remove = useCallback(
    (err: Err) => setErrors((errs) => errs.filter((x) => x !== err)),
    [setErrors]
  );

  if (err !== null) {
    setErrors((errs) => [...errs, err]);
  }

  return (
    <div class="flex flex-col gap-4">
      {errors.map((err) => (
        <TimedError key={err} err={err} remove={remove} />
      ))}
    </div>
  );
};
