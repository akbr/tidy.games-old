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

const showCard: DOMEffect<{
  player: number;
  perspective: number;
  numPlayers: number;
}> = ($el, { numPlayers, player, perspective }) => {
  const $card = Array.from($el.children)[0] as HTMLElement | void;
  if (!$card) return;

  const dimensions = getNearestDimensions($el);
  const heldPos = getHeldPosition(
    numPlayers,
    rotateIndex(numPlayers, player, -perspective),
    dimensions
  );
  const centerPos = {
    ...getCenterPlayedPosition(dimensions),
    rotate: randomBetween(-14, 14),
  };

  return seq([
    () =>
      style($card, [heldPos, centerPos], {
        duration: 1000,
      }),
    () => delay(300),
    () => style($card, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
  ]);
};

export function PlayedCard(props: GameProps<CondottiereSpec>) {
  const ref = useRef(null);
  const { action, room, ctx } = props;

  const playedCard = action && action.type === "play" ? action.data : null;
  const player = action ? action.player : -1;
  const isMe = player === room.player;

  useDOMEffect(showCard, ref, {
    player,
    perspective: room.player,
    numPlayers: ctx.numPlayers,
  });

  return (
    <div ref={ref}>
      {playedCard && !isMe && (
        <div class="absolute">
          <Card glyph={cardGlyphs[playedCard]} />
        </div>
      )}
    </div>
  );
}

export default PlayedCard;
