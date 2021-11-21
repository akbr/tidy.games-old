import type { WizardProps } from "./types";
import type { WizardPropsPlus } from "./AppOuter";

import { css } from "goober";
import { a, topMargins } from "@lib/components/commonCss";
import { EmojiButton, Button } from "@lib/components/common";

import { ScoreTable } from "./ScoreTable";

let flex = css`
  display: flex;
  gap: 0.2em;
`;

const TopButton = ({
  open,
  emoji,
  label,
}: {
  open: () => void;
  emoji: string;
  label: string;
}) => {
  return (
    <EmojiButton onClick={open}>
      <span role="img" aria-label={label}>
        {emoji}
      </span>
    </EmojiButton>
  );
};

function Scorez({ frame }: WizardProps) {
  const { state, room } = frame;

  if (room && state) {
    return (
      <div style={{ display: "grid", placeContent: "center" }}>
        <ScoreTable
          scores={state.scores}
          avatars={room.seats.map(({ avatar }) => avatar)}
          playerIndex={room.seatIndex}
        />
      </div>
    );
  }
  return null;
}

export const UiButtons = ({ actions, dialogActions }: WizardPropsPlus) => {
  const openOptions = () =>
    dialogActions.set(
      <Button
        onClick={() => {
          actions.exit();
          dialogActions.close();
        }}
      >
        Exit
      </Button>
    );
  const openScores = () => dialogActions.set(Scorez);

  return (
    <div class={`${a} ${flex} ${topMargins}`} style={{ zIndex: "500" }}>
      <TopButton emoji={"⚙️"} label={"Settings"} open={openOptions} />
      <TopButton emoji={"🗒️"} label={"Scorepad"} open={openScores} />
    </div>
  );
};
