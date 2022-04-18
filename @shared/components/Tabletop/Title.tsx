import { useState } from "preact/hooks";

import type { Spec } from "@lib/tabletop/spec";
import { TitleProps } from "@lib/tabletop/client";
import { Field } from "../Field";

export const Title = <S extends Spec>({
  controls,
  connected,
  cart,
}: TitleProps<S>) => {
  const [code, setCode] = useState("");
  const { join } = controls.server;

  return (
    <div class="flex flex-col h-full justify-center items-center gap-14 ">
      <div class="text-center font-bold text-[64px]">{cart.meta.name}</div>
      <div class="flex flex-col items-center gap-4">
        <Field legend="✨ New game">
          <div class="text-center">
            <button onClick={() => join()} disabled={!connected}>
              Create
            </button>
          </div>
        </Field>

        <h3 class="font-italic font-light"> OR </h3>
        <Field legend="✏️ Join game">
          <div class="flex gap-2 justify-center">
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
              Enter code
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
};