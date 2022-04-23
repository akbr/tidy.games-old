import { Twemoji } from "@shared/components/Twemoji";
import { ComponentChildren } from "preact";

import { Cards, cardGlyphs } from "../game/glossary";
import { getBattleStrength } from "../game/logic";
import { playerColors } from "@shared/ui/colors";
import { Badge } from "@shared/components/Badge";

import { countOf } from "@lib/array";

const Entry = ({ char = "X", num = 0 }) => {
  const opacity = num === 0 ? 0.2 : 1;
  return (
    <div class="inline-flex items-center w-[42px] h-[24px]" style={{ opacity }}>
      <Twemoji char={char} size={18} />
      <div class="flex content-center text-[14px] ml-1 w-full">x{num}</div>
    </div>
  );
};

const Total = ({
  colors,
  num,
}: {
  colors: readonly [string, string];
  num: number;
}) => (
  <div
    title="Total battle strength"
    class="flex items-center p-[4px] rounded-md cursor-default"
    style={{ backgroundColor: colors[0], color: colors[1] }}
  >
    {num}
  </div>
);

const Row = ({ children }: { children: ComponentChildren }) => (
  <div class="flex justify-around items-center p-[6px] ">{children}</div>
);

export type PlayerMatProps = {
  player: number;
  line: Cards[];
  isWinter: boolean;
};

export const PlayerMat = ({ player, line, isWinter }: PlayerMatProps) => {
  return (
    <div class="w-[160px] bg-[#51361A]  border-black border-solid border-[1px] rounded">
      <div class="flex flex-col border border-white rounded">
        <div class="bg-black bg-opacity-20">
          <Row>
            <div class="mr-3 flex gap-2">
              <Total
                colors={playerColors[player]}
                num={getBattleStrength(line, isWinter)}
              />
            </div>
            <Entry char={cardGlyphs["d"]} num={countOf("d", line)} />
            <Entry char={cardGlyphs["w"]} num={countOf("w", line)} />
          </Row>
        </div>

        <Row>
          <Entry char={cardGlyphs[1]} num={countOf(1, line)} />
          <Entry char={cardGlyphs[2]} num={countOf(2, line)} />
          <Entry char={cardGlyphs[3]} num={countOf(3, line)} />
        </Row>
        <Row>
          <Entry char={cardGlyphs[4]} num={countOf(4, line)} />
          <Entry char={cardGlyphs[5]} num={countOf(5, line)} />
          <Entry char={cardGlyphs[6]} num={countOf(6, line)} />
        </Row>
        <Row>
          <Entry char={cardGlyphs[10]} num={countOf(10, line)} />
          <Entry char={cardGlyphs["h"]} num={countOf("h", line)} />
          <Entry char={cardGlyphs["s"]} num={countOf("s", line)} />
        </Row>
      </div>
    </div>
  );
};

export default PlayerMat;
