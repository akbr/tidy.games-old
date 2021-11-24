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
// -------------------------------

const Block = styled("div")`
  width: 30px;
  height: 30px;
  background-color: mediumblue;
  border: 2px solid lightblue;
  pointer-events: auto;
`;

const Card = styled("div")`
  width: 80px;
  height: 112px;
  background-color: white;
  border: 2px solid black;
`;

const Container = styled("div")`
  display: flex;
  flex-flow: column;
  height: 100%;
`;

const Table = styled("div")`
  position: relative;
  flex: 1 1 auto;
`;

const HandContainer = styled("div")`
  position: relative;
  flex: 0 1 auto;
  margin-top: 10px;
`;

const WIP = () => {
  return (
    <WithUpdate
      fn={handleDrags}
      props={{ selector: "[data-poop]", onClick: console.log }}
    >
      <Container>
        <Table style={{ pointerEvents: "none" }}>
          <PositionSeats>
            <Block />
            <Block />
            <Block />
            <Block />
            <Block />
            <Block />
          </PositionSeats>
        </Table>
        <WithUpdate fn={positionHand} props={{ anim: "initial" }}>
          <HandContainer>
            <Card data-poop={1} />
            <Card />
            <Card />
            <Card />
            <Card />
          </HandContainer>
        </WithUpdate>
      </Container>
    </WithUpdate>
  );
};

render(<WIP />, document.getElementById("app")!);

/**
const placeHand: Updater<void> = ($el) => {
  const blocks = Array.from($el.childNodes) as HTMLElement[];
  if (blocks.length === 0) return;

  const containerRect = $el.getBoundingClientRect();
  const blockRect = blocks[0].getBoundingClientRect();

  const blocksWidth = blocks.length * blockRect.width;
  const centering = containerRect.width / 2 - blocksWidth / 2;

  blocks.forEach(($block, idx) => {
    $block.style.left = `${idx * blockRect.width + centering}px`;
  });
};

const _X = WithUpdate;

const _HandMagic: FunctionalComponent = ({ children }) => (
  <_X fn={placeHand}>{children}</_X>
);
 */
