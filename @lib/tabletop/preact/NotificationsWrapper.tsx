import { ComponentChildren, h } from "preact";
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "preact/hooks";

import { Spec } from "@lib/tabletop/core/spec";

export default function NotificationsWrapper<S extends Spec>({
  children,
}: {
  children: ComponentChildren;
}) {
  /**
   * 
      <div class="absolute bottom-2 left-2 z-50">
        <ErrorReciever err={err || null} />
        <ConnectionWarning connected={connected} />
      </div>
   */
  return <>{children}</>;
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
