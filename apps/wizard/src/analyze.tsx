import { getHistoryResults, History } from "@lib/tabletop/core/store";
import { wizardGame } from "./game/game";
import { decodeHistory } from "@lib/tabletop/server/utils";
import { WizardSpec } from "./game/spec";
import { render } from "preact";
import { MiniCard } from "@shared/components/Card";

const input = window.location.hash.slice(1);
const json = decodeHistory(input) as History<WizardSpec>;

//@ts-ignore
const results = getHistoryResults(wizardGame, json);
if (typeof results === "string") throw new Error();

//@ts-ignore
//document.body.textContent = JSON.stringify({ ...history, ...results });

let blar = results.boardSets
  .flat()
  .filter((x) => x.phase === "trickWon" || x.phase === "roundStart")
  .map((x) => (x.phase === "roundStart" ? `Round ${x.round}` : x.trick));

function App() {
  return (
    <div>
      {blar.map((x, i) => {
        if (typeof x === "string") {
          return (
            <div class="text-black font-extrabold">
              <br />
              {x}
            </div>
          );
        }
        return (
          <div>
            <div class="text-black">Trick {i}</div>
            {x.map((x) => (
              <MiniCard card={x} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

render(<App />, document.body);
