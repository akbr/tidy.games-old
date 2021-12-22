import { setup, styled, css, keyframes } from "goober";
import { ComponentChildren, h, render, cloneElement, VNode } from "preact";
import { spec } from "@lib/premix";
import {
  useRef,
  Ref,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "preact/hooks";
import { debounce } from "@lib/timing";

setup(h);

import { ResStream } from "./prototype";
import { server } from "@lib/io/client/extensions/server";
// -------------------------------

export type UnionizeObj<Obj extends Record<string, (...args: any) => any>> = {
  [Key in keyof Obj]: ReturnType<Obj[Key]> extends undefined
    ? { type: Key; data?: undefined }
    : { type: Key; data: ReturnType<Obj[Key]> };
}[keyof Obj];

const actions = {
  start: () => undefined,
  play: (input: 1 | 2 | null, bool: boolean) => input,
};

type Actions = UnionizeObj<typeof actions>;

let test = wrap("hola", { name: "Aaron" });

const serverActions: ActionFns<ActionGlossary> = {
  join: () => ({ id: "test" }),
  start: () => undefined,
};

const ActionInput = ({
  actionKey,
  fn,
}: {
  actionKey: string;
  fn: (str: string) => object | undefined;
}) => {
  const button = <button>{actionKey}</button>;
  if (fn.length > 0) {
    return (
      <div>
        {button}
        <input></input>
      </div>
    );
  }
  return button;
};

const WIP = () => {
  return (
    <>
      {Object.entries(serverActions).map(([actionKey, fn]) => (
        <ActionInput actionKey={actionKey} fn={fn} />
      ))}
    </>
  );
};
render(<WIP />, document.getElementById("app")!);
