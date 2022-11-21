import { ComponentChildren } from "preact";
import { Twemoji } from "@shared/components/Twemoji";
import { OptionsDialog } from "./Dialogs";
import { ScoreTable } from "./ScoreTable";

import { useGame, setDialog } from "~src/control";

export const UiButtons = () => {
  return (
    <Position>
      <Box>
        <OptionsButton />
        <ScoresButton />
      </Box>
    </Position>
  );
};

function Position({ children }: { children: ComponentChildren }) {
  return <div class="absolute top-0 left-0 m-1">{children}</div>;
}

function Box({ children }: { children: ComponentChildren }) {
  return <div class="flex gap-2 p-2">{children}</div>;
}

function OptionsButton() {
  return (
    <div
      class="cursor-pointer"
      onClick={() => {
        setDialog(OptionsDialog);
      }}
    >
      <Twemoji char={"⚙️"} size={36} />
    </div>
  );
}

function ScoresButton() {
  const scores = useGame((x) => x.board.scores);

  return scores.length <= 0 ? null : (
    <div
      class="cursor-pointer"
      onClick={() => {
        setDialog(ScoreTable);
      }}
    >
      <Twemoji char={"🗒️"} size={36} />
    </div>
  );
}
