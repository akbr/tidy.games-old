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

import { DialogOf } from "@lib/components/Dialog";
// -------------------------------

const WIP = () => {
  return (
    <DialogOf close={() => console.log("hi")}>
      <div class="text-black">!!!</div>
    </DialogOf>
  );
};
render(<WIP />, document.getElementById("app")!);
