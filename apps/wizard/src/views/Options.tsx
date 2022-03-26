import { OptionsView } from "@lib/tabletop/views";
import { WizardSpec } from "../game";

export const Options: OptionsView<WizardSpec> = () => {
  return (
    <div class="flex flex-col w-full gap-2">
      <div class="flex gap-2">
        <input
          type="checkbox"
          name="evenBids"
          class="mt-1"
          onChange={(e: any) => console.log(e.target.name, e.target.checked)}
        />
        <div class="text-sm ">
          <span class="font-bold">No even bids: </span>
          <span>Bids cannot equal number of cards in round.</span>
        </div>
      </div>
      <div class="flex gap-2">
        <input
          class="w-10"
          type="number"
          name="numRounds"
          min="1"
          max="20"
          value="20"
        />
        <div class="text-sm ">
          <span class="font-bold">Number of rounds.</span>
        </div>
      </div>
    </div>
  );
};
