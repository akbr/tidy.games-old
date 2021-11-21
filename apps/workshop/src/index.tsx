import { setup, styled, css, keyframes } from "goober";
import { ComponentChildren, h, render } from "preact";
import {
  useRef,
  Ref,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "preact/hooks";

setup(h);

import { Appear, DeadCenterWrapper, Throb } from "@lib/components/common";
import { Badge } from "@lib/components/Badge";
import { Twemoji } from "@lib/components/Twemoji";
// -------------------------------

const WIP = () => {
  return (
    <DeadCenterWrapper>
      <div>Hello, world!</div>
    </DeadCenterWrapper>
  );
};
let $app = document.getElementById("app")!;
render(<WIP />, $app);
