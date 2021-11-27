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

import { Twemoji } from "@lib/components/Twemoji";

setup(h);

const Entry = ({ char = "X", num = 0 }: { char: string; num: number }) => {
  const opacity = num === 0 ? 0.3 : 1;
  return (
    <div class="inline-flex items-center w-[42px] h-[24px]" style={{ opacity }}>
      <Twemoji char={char} size={18} />
      <div class="flex content-center text-[14px] ml-1 w-full">x{num}</div>
    </div>
  );
};

const playArea = "flex flex-col border border-white rounded";
const row = "flex justify-around items-center p-1";
const modifiersRow = `${row} bg-black bg-opacity-20`;
const total = "flex items-center p-1 bg-red-600 rounded-md";

const CardMat = () => {
  return (
    <div class={playArea}>
      <div class={modifiersRow}>
        <Entry char="🥁" num={1} />
        <Entry char="❄️" num={0} />
        <div class={total}>30</div>
      </div>
      <div class={row}>
        <Entry char="1️⃣" num={1} />
        <Entry char="2️⃣" num={2} />
        <Entry char="3️⃣" num={0} />
      </div>
      <div class={row}>
        <Entry char="4️⃣" num={1} />
        <Entry char="5️⃣" num={0} />
        <Entry char="6️⃣" num={1} />
      </div>
      <div class={row}>
        <Entry char="🔟" num={0} />
        <Entry char="🗡️" num={0} />
        <Entry char="💨" num={0} />
      </div>
    </div>
  );
};

const WIP = () => {
  return (
    <div class="w-[160px]">
      <CardMat />
      <div class="flex items-center justify-around mt-1">
        <div>Meety</div>
        <Entry char="🎴" num={12} />
      </div>
    </div>
  );
};

let $app = document.getElementById("app")!;
render(<WIP />, $app);

export default "";
