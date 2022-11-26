import { ComponentChildren } from "preact";
import { Twemoji } from "@shared/components/Twemoji";
import { OptionsDialog } from "./Dialogs";
import { ScoreTable } from "./ScoreTable";

import { useGame, setDialog } from "~src/control";

export const UiButtons = () => {
  return (
    <section id="uiButtons" class="absolute top-0 left-0">
      <Box>
        <OptionsButton />
        <ScoresButton />
      </Box>
    </section>
  );
};

function Box({ children }: { children: ComponentChildren }) {
  return <div class="flex gap-3 p-3">{children}</div>;
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
