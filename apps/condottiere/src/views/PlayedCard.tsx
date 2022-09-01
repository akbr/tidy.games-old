import { GameProps } from "@lib/tabletop";
import CondottiereSpec from "src/game/spec";

import { Card } from "./Card";
import { cardGlyphs } from "../game/glossary";

export function PlayedCard(props: GameProps<CondottiereSpec>) {
  const { state, room, action } = props;

  const playedCard = action && action.type === "play" ? action.data : null;
  const player = action ? action.player : -1;

  return <div>{playedCard && <Card glyph={cardGlyphs[playedCard]} />}</div>;
}

export default PlayedCard;
