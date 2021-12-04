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

import { PositionSeats } from "@lib/components/PositionSeats";
import { Twemoji } from "@lib/components/Twemoji";
import { spec } from "@lib/premix";

setup(h);

const EntryContainer = spec(
  <div class="inline-flex items-center w-[42px] h-[24px]" />
);
const EntryNumber = spec(
  <div class="flex content-center text-[14px] ml-1 w-full" />
);
const Entry = ({ char = "X", num = 0 }: { char: string; num: number }) => {
  const opacity = num === 0 ? 0.3 : 1;
  return (
    <EntryContainer style={{ opacity }}>
      <Twemoji char={char} size={18} />
      <EntryNumber>x{num}</EntryNumber>
    </EntryContainer>
  );
};

const PlayArea = spec(
  <div class="flex flex-col border border-white rounded" />
);
const Row = spec(<div class="flex justify-around items-center p-1" />);
const Total = spec(<div class="flex items-center p-1 bg-red-600 rounded-md" />);

const CardMat = () => {
  return (
    <PlayArea>
      <Row class="bg-black bg-opacity-20">
        <Entry char="🥁" num={1} />
        <Entry char="❄️" num={0} />
        <Total>30</Total>
      </Row>
      <Row>
        <Entry char="1️⃣" num={1} />
        <Entry char="2️⃣" num={2} />
        <Entry char="3️⃣" num={0} />
      </Row>
      <Row>
        <Entry char="4️⃣" num={1} />
        <Entry char="5️⃣" num={0} />
        <Entry char="6️⃣" num={1} />
      </Row>
      <Row>
        <Entry char="🔟" num={0} />
        <Entry char="🗡️" num={0} />
        <Entry char="💨" num={0} />
      </Row>
    </PlayArea>
  );
};

const PlayerMatContainer = spec(<div class="w-[160px]" />);
const BottomStuff = spec(<div class="flex items-center justify-around mt-1" />);
const Mat = () => {
  return (
    <PlayerMatContainer>
      <CardMat />
      <BottomStuff>
        <div>Meety</div>
        <Entry char="🎴" num={12} />
      </BottomStuff>
    </PlayerMatContainer>
  );
};

const WIP = () => (
  <PositionSeats>
    <Mat />
    <Mat />
    <Mat />
    <Mat />
  </PositionSeats>
);

let $app = document.getElementById("app")!;
render(<WIP />, $app);

export default "";
