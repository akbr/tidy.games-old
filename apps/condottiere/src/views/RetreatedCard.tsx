import { GameProps } from "@lib/tabletop";
import CondottiereSpec from "src/game/spec";

import { Card } from "./Card";
import { cardGlyphs } from "../game/glossary";
import { DOMEffect, useDOMEffect } from "@lib/hooks";
import { useRef } from "preact/hooks";
import {
  getCenterPlayedPosition,
  getHeldPosition,
} from "@shared/components/PositionTrick/trickLayout";
import { getNearestDimensions } from "@lib/dom";
import style from "@lib/stylus";
import { rotateIndex } from "@lib/array";
import { randomBetween } from "@lib/random";
import { delay, seq } from "@lib/async/task";

const retreatCard: DOMEffect<{
  player: number;
  perspective: number;
  numPlayers: number;
}> = ($el, { numPlayers, player, perspective }) => {
  const $card = Array.from($el.children)[0] as HTMLElement | void;
  if (!$card) return;

  const dimensions = getNearestDimensions($el);
  const centerPos = {
    ...getCenterPlayedPosition(dimensions),
    rotate: randomBetween(-14, 14),
  };

  const heldPos = getHeldPosition(
    numPlayers,
    rotateIndex(numPlayers, player, -perspective),
    dimensions
  );

  return seq([
    () => style($card, { opacity: 0, ...centerPos }),
    () => style($card, { opacity: 1 }, { duration: 500 }),
    () => delay(300),
    () =>
      style($card, [centerPos, heldPos], {
        duration: 1000,
      }),
  ]);
};

export function RetreatedCard(props: GameProps<CondottiereSpec>) {
  const ref = useRef(null);
  const { action, room, ctx } = props;

  const retreatedCard =
    action && action.type === "retreat" ? action.data : null;

  const player = action ? action.player : 0;

  useDOMEffect(retreatCard, ref, {
    player,
    perspective: room.player,
    numPlayers: ctx.numPlayers,
  });

  return (
    <div ref={ref}>
      {retreatedCard && (
        <div class="absolute">
          <Card glyph={cardGlyphs[retreatedCard]} />
        </div>
      )}
    </div>
  );
}

export default RetreatedCard;
