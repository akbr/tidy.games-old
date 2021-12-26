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

// -------------------------------
import { JSONDiff } from "./protoView/json";

const prev = { name: "Aaron", age: 22, head: { hair: "brown" } };
const curr = { name: "Aaron", age: 22, head: { hair: "brown" } };

const WIP = () => {
  return (
    <div>
      <div class="">
        <pre class="font-bold text-lg">deal</pre>
        <JSONDiff curr={curr} prev={prev} />
      </div>
    </div>
  );
};
render(<WIP />, document.getElementById("app")!);

/**
      <div class="absolute top-1 left-1 ">
        <pre class="inline bg-green-700 ">connected</pre>
        <JSONDisplay obj={{ room: "data", name: "bob", players: [1, 2, 34] }} />
      </div>
 */
