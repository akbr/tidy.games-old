import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { styled } from "goober";
import { Fieldset, Button } from "@lib/components/common";

const Banner = styled("div")`
  display: inline-block;
  text-align: center;
  filter: drop-shadow(0px 0px 0.15em blue);
  font-size: 6em;
`;

const GameInput = styled("input")`
  margin-right: 1em;
  text-transform: uppercase;
  border-radius: 15px;
  border: none;
  font-size: 1.5em;
  text-align: center;
  height: 1.75em;
`;

const TitleBlock = () => (
  <div class="w-min mt-4">
    <Banner>Wizard</Banner>
    <div class="inline-block w-full -mt-4 pr-2 text-right">
      Bid your way to victory!
    </div>
  </div>
);

type JoinProps = { join: (id?: string) => void };

const Interface = ({ join }: JoinProps) => {
  const [code, setCode] = useState("");
  return (
    <div class="flex flex-col items-center gap-4">
      <Button onClick={() => join()}>New Game</Button>
      <h2> OR </h2>
      <Fieldset>
        <legend>✏️ Enter a code:</legend>
        <GameInput
          onInput={
            //@ts-ignore
            (e: Event) => setCode(e.target.value.toUpperCase())
          }
          type="text"
          size={4}
          maxLength={4}
        ></GameInput>
        <Button
          onClick={() => {
            join(code);
          }}
        >
          Join Game
        </Button>
      </Fieldset>
    </div>
  );
};

export const PreGameWrapper = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  return (
    <>
      <div class="flex flex-col items-center">
        <TitleBlock />
      </div>
      {children}
      <div class="absolute bottom-0 right-0 text-sm text-right p-2">
        <div>Wizard by Ken Fisher.</div>
        <div>App by Aaron Rieke.</div>
      </div>
    </>
  );
};

export const Title = ({ join }: JoinProps) => (
  <PreGameWrapper>
    <div style={{ marginTop: "3em" }}>
      <Interface join={join} />
    </div>
  </PreGameWrapper>
);
