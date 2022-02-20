import { Frame } from "@lib/tabletop";
import { WizardSpec } from "../game";

const Announce = ({ str }: { str: string }) => (
  <h2 class="text-white">{str}</h2>
);

export const TableContent = ({ frame }: { frame: Frame<WizardSpec> }) => {
  const [type, game] = frame.gameState;

  return <Announce str={type === "roundStart" ? "Round start!" : ""} />;
};
