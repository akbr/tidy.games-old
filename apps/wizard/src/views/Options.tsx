import { OptionsView } from "@lib/tabletop/client/views/OptionsView";
import { WizardSpec } from "../game/spec";

export const Options: OptionsView<WizardSpec> = ({
  numPlayers,
  options,
  setOptions,
}) => {
  numPlayers = numPlayers < 2 ? 2 : numPlayers;

  return (
    <div class="flex flex-col w-full gap-2">
      <div class="flex gap-2">
        <input
          type="checkbox"
          name="evenBids"
          class="mt-1"
          checked={options.canadian}
          onChange={(e: any) =>
            setOptions({ ...options, canadian: e.target.checked })
          }
        />
        <div class="text-sm ">
          <span class="font-bold">No even bids: </span>
          <span>Total bids cannot equal number of cards in round.</span>
        </div>
      </div>
      <div class="flex gap-2">
        <input
          class="w-10"
          type="number"
          name="numRounds"
          min="1"
          max={60 / numPlayers}
          value={options.numRounds > 30 ? 30 : options.numRounds}
          onChange={(e: any) =>
            setOptions({ ...options, numRounds: parseInt(e.target.value, 10) })
          }
        />
        <div class="text-sm ">
          <span class="font-bold">Number of rounds.</span>
        </div>
      </div>
    </div>
  );
};
