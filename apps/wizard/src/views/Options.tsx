import { AppViews } from "@lib/tabletop/preact/App";
import { WizardSpec } from "../game/spec";

export const BidsDescript = () => (
  <div>
    <span class="font-bold">No even bids: </span>
    <span>Total bids cannot equal number of cards in round.</span>
  </div>
);

export const OptionsDisplay = ({
  options,
}: {
  options: WizardSpec["options"];
}) => {
  return (
    <div>
      <div>
        <span class="font-bold">Number of rounds: </span>
        <span>{options.numRounds}</span>
      </div>
      {options.canadian && <BidsDescript />}
    </div>
  );
};

export const OptionsView: AppViews<WizardSpec>["OptionsView"] = ({
  numPlayers,
  options,
  updateOptions,
}) => {
  return (
    <table>
      <tr>
        <td class="text-center pr-2">
          <input
            class="w-10 text-right"
            type="number"
            name="numRounds"
            min="1"
            max={60 / numPlayers}
            value={options.numRounds > 30 ? 30 : options.numRounds}
            onChange={(e: any) =>
              updateOptions({
                ...options,
                numRounds: parseInt(e.target.value, 10),
              })
            }
          />
        </td>
        <td>
          <div class="font-bold">Number of rounds.</div>
        </td>
      </tr>
      <tr class="h-1.5" />
      <tr>
        <td class="text-center pr-2">
          <input
            type="checkbox"
            style={{ transform: "scale(1.5)" }}
            name="evenBids"
            checked={options.canadian}
            onChange={(e: any) =>
              updateOptions({ ...options, canadian: e.target.checked })
            }
          />
        </td>
        <td>
          <BidsDescript />
        </td>
      </tr>
    </table>
  );
};
