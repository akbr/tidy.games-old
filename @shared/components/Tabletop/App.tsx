import { ComponentChildren, h } from "preact";
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "preact/hooks";

import { Cart } from "@lib/tabletop/cart";
import { Spec } from "@lib/tabletop/spec";
import { ClientState, GameProps, TitleProps } from "@lib/tabletop/client";

import { Title as DefaultTitle } from "./Title";
import { Lobby as DefaultLobby, LobbyViewProps } from "./Lobby";
import { OptionsView } from "./OptionsView";

export type AppViews<S extends Spec> = {
  Backdrop?: (props: { clientState: ClientState<S> }) => JSX.Element;
  AppContainer?: (props: { clientState: ClientState<S> }) => JSX.Element;
  Title?: (props: TitleProps<S>) => JSX.Element;
  Lobby?: (props: LobbyViewProps<S>) => JSX.Element;
  Options?: OptionsView<S>;
  Game?: (props: GameProps<S>) => JSX.Element;
};

export type AppProps<S extends Spec> = {
  state: ClientState<S>;
  cart: Cart<S>;
  views: AppViews<S>;
};

export function App<S extends Spec>({ state, views, cart }: AppProps<S>) {
  const [type, props] = state;
  const {
    Backdrop = DefaultBackrop,
    AppContainer = DefaultAppContainer,
    Title = DefaultTitle,
    Lobby = DefaultLobby,
    Game = DefaultGame,
    Options,
  } = views;

  return (
    <Backdrop clientState={state}>
      <AppContainer clientState={state}>
        <NotificationsWrapper {...props}>
          {(() => {
            if (type === "title") {
              return <Title {...props} />;
            }

            if (type === "lobby") {
              const { setOptions } = cart;
              return <Lobby {...{ ...props, Options, setOptions }} />;
            }

            if (type === "game") {
              return <Game {...props} />;
            }
          })()}
        </NotificationsWrapper>
      </AppContainer>
    </Backdrop>
  );
}

export default App;

function DefaultBackrop({ children }: { children: ComponentChildren }) {
  return (
    <section type="Backdrop" class="h-full flex justify-center bg-[#2a1b0e]">
      {children}
    </section>
  );
}

function DefaultAppContainer({ children }: { children: ComponentChildren }) {
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

function DefaultGame<S extends Spec>(props: GameProps<S>) {
  return <div>{JSON.stringify(props)}</div>;
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
