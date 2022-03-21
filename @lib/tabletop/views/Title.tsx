import { useState } from "preact/hooks";
import { Spec } from "@lib/tabletop/types";
import { TitleProps } from "../client";

export const Title = <S extends Spec>({
  controls,
  connected,
  meta,
}: TitleProps<S>) => {
  const [code, setCode] = useState("");
  const { join } = controls.server;

  return (
    <div class="flex flex-col items-center">
      <div class="text-center m-6 font-bold text-[64px]">{meta.name}</div>
      <div class="flex flex-col items-center gap-4">
        <button onClick={() => join({ id: "TEST" })} disabled={!connected}>
          New Game
        </button>
        <h2> OR </h2>
        <fieldset class="p-2">
          <legend>✏️ Enter a code:</legend>
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
        </fieldset>
      </div>
    </div>
  );
};
