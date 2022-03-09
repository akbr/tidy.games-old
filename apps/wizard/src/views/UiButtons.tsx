import { GameProps } from "./types";
import { Twemoji } from "@lib/components/Twemoji";
import { DialogOf } from "@lib/components/DialogOf";
import { useState } from "preact/hooks";
import { FunctionalComponent } from "preact";

const Options = (props: GameProps) => {
  return <div>Hello from options!</div>;
};

const CheapScores = (props: GameProps) => {
  return <div>{JSON.stringify(props.frame.state[1].hands)}</div>;
};

export const UiButtons = (props: GameProps) => {
  const [Dialog, setDialog] = useState<FunctionalComponent<GameProps> | null>(
    null
  );

  return (
    <>
      <div class="absolute top-0 left-0 m-1">
        <div class="flex gap-2 p-2">
          <div class="cursor-pointer" onClick={() => setDialog(() => Options)}>
            <Twemoji char={"⚙️"} size={36} />
          </div>
          <div
            class="cursor-pointer"
            onClick={() => setDialog(() => CheapScores)}
          >
            <Twemoji char={"🗒️"} size={36} />
          </div>
        </div>
      </div>
      {Dialog && (
        <DialogOf close={() => setDialog(null)}>
          <Dialog {...props} />
        </DialogOf>
      )}
    </>
  );
};
