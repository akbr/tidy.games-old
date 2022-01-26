import { Twemoji } from "@lib/components/Twemoji";
import { spec } from "@lib/premix";
import { FunctionComponent } from "preact";

const Entry = ({ char = "X", num = 0 }) => {
  const opacity = num === 0 ? 0.3 : 1;
  return (
    <div class="inline-flex items-center w-[42px] h-[24px]" style={{ opacity }}>
      <Twemoji char={char} size={18} />
      <div class="flex content-center text-[14px] ml-1 w-full">x{num}</div>
    </div>
  );
};

const Total: FunctionComponent = ({ children }) => (
  <div class="flex items-center p-1 bg-red-600 rounded-md">{children}</div>
);

const Row = spec(<div class="flex justify-around items-center p-1" />);

const CardMat = () => {
  return (
    <div class="flex flex-col border border-white rounded">
      <Row class="bg-black bg-opacity-20">
        <Entry char="🥁" num={1} />
        <Entry char="❄️" num={0} />
        <Total>30</Total>
      </Row>
      <Row>
        <Entry char="1️⃣" num={1} />
        <Entry char="2️⃣" num={2} />
        <Entry char="3️⃣" num={0} />
      </Row>
      <Row>
        <Entry char="4️⃣" num={1} />
        <Entry char="5️⃣" num={0} />
        <Entry char="6️⃣" num={1} />
      </Row>
      <Row>
        <Entry char="🔟" num={0} />
        <Entry char="🗡️" num={0} />
        <Entry char="💨" num={0} />
      </Row>
    </div>
  );
};

const PlayerMatContainer = spec(<div class="w-[160px]" />);
const BottomStuff = spec(<div class="flex items-center justify-around mt-1" />);
export const PlayerMat = () => {
  return (
    <PlayerMatContainer>
      <CardMat />
      <BottomStuff>
        <div>Meety</div>
        <Entry char="🎴" num={12} />
      </BottomStuff>
    </PlayerMatContainer>
  );
};
