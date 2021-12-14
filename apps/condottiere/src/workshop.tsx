if (process.env.NODE_ENV === "development") require("preact/debug");

import { setup, styled, css, keyframes } from "goober";
import { ComponentChildren, FunctionalComponent, h, render } from "preact";
import {
  useRef,
  Ref,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "preact/hooks";

import { PlayerMat } from "./views/PlayerMat";

setup(h);

const WIP = () => <PlayerMat />;

let $app = document.getElementById("app")!;
render(<WIP />, $app);

export default "";
