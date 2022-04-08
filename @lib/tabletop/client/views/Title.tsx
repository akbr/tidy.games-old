import type { Spec } from "../../spec";

import { useState } from "preact/hooks";
import { TitleProps } from "..";
import { Disconnected } from "./Disconnected";
import { Field } from "@lib/components/Field";

export const Title = <S extends Spec>({
  controls,
  connected,
  cart,
}: TitleProps<S>) => {
  const [code, setCode] = useState("");
  const { join } = controls.server;

  return (
    <div class="flex flex-col h-full justify-center items-center gap-4">
      <div class="text-center font-bold text-[64px]">{cart.meta.name}</div>
      {connected ? (
        <div class="flex flex-col items-center gap-4">
          <Field legend="✨ New game">
            <div class="text-center">
              <button onClick={() => join()} disabled={!connected}>
                Start
              </button>
            </div>
          </Field>

          <h3 class="font-italic font-light"> OR </h3>
          <Field legend="✏️ Enter a code">
            <div class="flex gap-2">
              <input
                onInput={
                  //@ts-ignore
                  (e: Event) => setCode(e.target.value.toUpperCase())
                }
                type="text"
                size={4}
                maxLength={4}
              ></input>
              <button
                onClick={() => {
                  join({ id: code });
                }}
                disabled={!connected}
              >
                Join Game
              </button>
            </div>
          </Field>
        </div>
      ) : (
        <Disconnected />
      )}
    </div>
  );
};
