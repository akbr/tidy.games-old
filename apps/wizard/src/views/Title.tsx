import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { styled } from "goober";
import { Fieldset, Button, Container } from "@lib/components/common";

const TitleWrapper = styled("div")`
  margin-top: 1em;
  width: min-content;
`;

const Banner = styled("div")`
  display: inline-block;
  text-align: center;
  filter: drop-shadow(0px 0px 0.15em blue);
  font-family: "Berkshire Swash", cursive;
  font-size: 6em;
`;

const SubBanner = styled("div")`
  display: inline-block;
  width: 100%;
  margin-top: -1em;
  padding-right: 0.25em;
  text-align: right;
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

const Footer = styled("div")`
  position: absolute;
  font-size: 12px;
  bottom: 0.6em;
  right: 0.6em;
`;

const TitleBlock = () => (
  <TitleWrapper>
    <Banner>Wizard</Banner>
    <SubBanner>Bid your way to victory!</SubBanner>
  </TitleWrapper>
);

type JoinProps = { join: (id?: string) => void };

const Interface = ({ join }: JoinProps) => {
  const [code, setCode] = useState("");
  return (
    <Container style={{ gap: "1em" }}>
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
    </Container>
  );
};

export const PreGameWrapper = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  return (
    <>
      <Container>
        <TitleBlock />
      </Container>
      {children}
      <Footer style={{ textAlign: "right" }}>
        <div>Wizard by Ken Fisher.</div>
        <div>App by Aaron Rieke.</div>
      </Footer>
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
