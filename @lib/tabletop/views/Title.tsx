import { useState } from "preact/hooks";
import { Spec } from "@lib/tabletop/types";
import { TitleProps } from "../client";

type JoinProps = { join: (id: string) => void };

const Interface = ({ join }: JoinProps) => {
  const [code, setCode] = useState("");
  return (
    <div class="flex flex-col items-center gap-4">
      <button onClick={() => join("TEST")}>New Game</button>
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
            join(code);
          }}
        >
          Join Game
        </button>
      </fieldset>
    </div>
  );
};

export const Title = <S extends Spec>(props: TitleProps<S>) => {
  return (
    <div>
      <h2>Title</h2>
      <Interface
        join={(id: string) => {
          props.controls.server.join({ id });
        }}
      />
    </div>
  );
};
