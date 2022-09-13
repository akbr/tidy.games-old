import { ComponentChildren, h } from "preact";
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "preact/hooks";

import { Spec } from "../core/spec";
import { Client, Frame } from "../client";
import { useSubscribable } from "@lib/subscribable";

export function NotificationsWrapper<S extends Spec>({
  children,
  client,
}: {
  children: ComponentChildren;
  client: Client<S>;
}) {
  const [err, connected] = useSubscribable(client, (x) => [
    x.frame.err,
    x.frame.connected,
  ]);

  return (
    <>
      {children}
      <div class="absolute bottom-2 left-2 z-50">
        <ErrorReciever err={err} />
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
      WebSocket not connected.
      <button onClick={() => location.reload()}>Reload 🔄</button>
    </div>
  ) : null;
}

const TimedError = <S extends Spec>({
  err,
  remove,
}: {
  err: NonNullable<Frame<S>["err"]>;
  remove: (err: Frame<S>["err"]) => void;
}) => {
  useLayoutEffect(() => {
    let timeout = setTimeout(() => {
      remove(err);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [err]);

  return (
    <div class="inline-block bg-red-600 p-2 rounded-lg text-white">
      {err.msg}
    </div>
  );
};
function ErrorReciever<S extends Spec>({ err }: { err: Frame<S>["err"] }) {
  const errRef = useRef<Frame<S>["err"]>(null);
  const [errors, setErrors] = useState<NonNullable<Frame<S>["err"]>[]>([]);

  const remove = useCallback(
    (err: Frame<S>["err"]) =>
      setErrors((errs) => errs.filter((x) => x !== err)),
    [setErrors]
  );

  if (err && err !== errRef.current) {
    errRef.current = err;
    setErrors((errs) => [...errs, err]);
  }
  return (
    <div class="flex flex-col gap-4">
      {errors.map((err) => (
        <TimedError key={err} err={err} remove={remove} />
      ))}
    </div>
  );
}
