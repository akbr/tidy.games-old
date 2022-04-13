import { getSeatRatio } from "./seatsLayout";
import { ComponentChildren, toChildArray } from "preact";

const getTranslateAdjustment = (ratio: number) =>
  ratio === 0 ? 0 : ratio === 1 ? -100 : -50;

const getStyle = ([xRatio, yRatio]: number[]) => ({
  left: `${xRatio * 100}%`,
  top: `${yRatio * 100}%`,
  transform: `translate(
    ${getTranslateAdjustment(xRatio)}%,
    ${getTranslateAdjustment(yRatio)}%
  )`,
});

export const PositionSeats = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const childArray = toChildArray(children);
  const numSeats = childArray.length;

  return (
    <>
      {childArray.map((child, index) => {
        const ratio = getSeatRatio(numSeats, index);
        return (
          <div class="absolute" style={getStyle(ratio)}>
            {child}
          </div>
        );
      })}
    </>
  );
};
export default PositionSeats;
