import { tw, animation } from "twind/css";
import { WaitFor } from "@lib/state/meter";
import { getScore } from "../../game/logic";

const animTime = 3500;
const scoreAppear = animation(`${animTime}ms both`, {
  "0%": {
    transform: "scale(1)",
  },
  "20%": {
    transform: "scale(2) rotate(32deg)",
  },
  "40%": {
    transform: "scale(1)",
    opacity: 1,
  },
  "70%": {
    transform: "scale(1)",
    opacity: 1,
  },
  "90%": {
    opacity: 0,
  },
  "100%": {
    transform: "translateY(-15px)",
    opacity: 0,
  },
});

const getTextShadow = (color: string) => `0 0 7px ${color}, 0 0 10px ${color},
0 0 21px ${color}`;

export const ScorePop = ({
  bid,
  actual,
  waitFor,
}: {
  bid: number;
  actual: number;
  waitFor: WaitFor;
}) => {
  const score = getScore(bid, actual);

  waitFor(animTime);

  return (
    <div
      class={`${tw(scoreAppear)}`}
      style={{
        textShadow: getTextShadow(score > 0 ? "blue" : "red"),
      }}
    >
      {score > 0 ? `+${score}` : `${score}`}
    </div>
  );
};
