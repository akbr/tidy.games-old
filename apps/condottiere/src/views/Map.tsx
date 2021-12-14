//@ts-ignore
import map from "../../assets/map.jpg";

const mapCoords = {
  tor: [45, 90],
  mil: [190, 70],
  ven: [480, 155],
  man: [320, 195],
  gen: [75, 255],
  par: [180, 350],
  mod: [305, 275],
  fer: [405, 285],
  luc: [175, 430],
  bol: [350, 335],
  fir: [330, 440],
  sie: [240, 555],
  urb: [470, 510],
  spo: [420, 630],
  anc: [570, 565],
  rom: [390, 785],
  nap: [540, 815],
};
//

const Dot = ({ x, y }: { x: number; y: number }) => {
  return (
    <div
      class="absolute"
      style={{ transform: "translate(-50%, -50%)", top: y, left: x }}
    >
      <div class="bg-red-500 border-solid border-black w-8 h-8 rounded-[50%]" />
    </div>
  );
};

export const Map = () => (
  <div>
    <div class="relative">
      {Object.entries(mapCoords).map(([id, coords]) => {
        const [x, y] = coords;
        return <Dot x={x} y={y} />;
      })}
    </div>
    <img src={map} />
  </div>
);
