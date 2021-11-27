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
import { debounce } from "@lib/timing";

setup(h);

// -------------------------------

const Block = styled("div")`
  width: 30px;
  height: 30px;
  background-color: mediumblue;
  border: 2px solid lightblue;
`;

const Card = styled("div")`
  position: absolute;
  width: 80px;
  height: 112px;
  background-color: white;
  border: 2px solid black;
`;

const WIP = () => {
  return <div class="bg-green-700 absolute right-0">Helo</div>;
};

render(<WIP />, document.getElementById("app")!);
