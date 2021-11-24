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

setup(h);

import { Appear, DeadCenterWrapper, Throb } from "@lib/components/common";
import { Badge } from "@lib/components/Badge";
import { Twemoji } from "@lib/components/Twemoji";
import { Updater, WithUpdate } from "@lib/premix";
import { PositionSeats } from "@lib/components/PositionSeats";
import { positionHand } from "@lib/layouts/hand";
import { handleDrags } from "@lib/layouts/drag";
import { positionTrick } from "../../../@lib/layouts/trick";
// -------------------------------

const Block = styled("div")`
  width: 30px;
  height: 30px;
  background-color: mediumblue;
  border: 2px solid lightblue;
  pointer-events: auto;
`;

const Card = styled("div")`
  position: absolute;
  width: 80px;
  height: 112px;
  background-color: white;
  border: 2px solid black;
`;
const WIP = () => {
  return <Card />;
};

render(<WIP />, document.getElementById("app")!);
