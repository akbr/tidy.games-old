import { useState } from "preact/hooks";
import { Spec } from "@lib/tabletop/types";
import { TitleProps } from "../client";

export const Title = <S extends Spec>({
  controls,
  connected,
}: TitleProps<S>) => {
  const [code, setCode] = useState("");
  const { join } = controls.server;

  return (
    <div>
      <h2>Title</h2>
      <div class="flex flex-col items-center gap-4">
        <button onClick={() => join({ id: "TEST" })} disabled={!connected}>
          New Game
        </button>
        <h2> OR </h2>
        <fieldset>
          <legend>✏️ Enter a code:</legend>
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
        </fieldset>
      </div>
    </div>
  );
};
