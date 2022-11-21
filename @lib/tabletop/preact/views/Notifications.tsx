import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";

import { useEmitter } from "@lib/emitter";

import { Spec } from "../../core/spec";
import { AppProps } from "../types";

export function Notifications<S extends Spec>(props: AppProps<S>) {
  const connected = useEmitter(props.client.emitter, (x) => x.connected);

  return (
    <section id="errors" class="absolute bottom-2 left-2 z-50">
      <ConnectionWarning connected={connected} />
    </section>
  );
}

export default Notifications;

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

function ErrorReciever<S extends Spec>({ client }: AppProps<S>) {
  const err = useEmitter(client.emitter, (x) => x.err); // This breaks b/c it shallow checks
  const [show, setShow] = useState(true);

  useLayoutEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
    }, 1000);
    return () => {
      clearTimeout(t);
      setShow(true);
    };
  }, [err]);

  if (!err) return null;

  return (
    <div class="flex flex-col gap-4" style={{ opacity: show ? 1 : 0 }}>
      <div class="inline-block bg-red-600 p-2 rounded-lg text-white">
        {err.msg}
      </div>
    </div>
  );
}
