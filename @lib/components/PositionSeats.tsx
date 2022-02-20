import { getSeatRatio } from "../layouts/seats";
import { FunctionalComponent, toChildArray } from "preact";

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

export const PositionSeats: FunctionalComponent = ({ children }) => {
  const arrayChildren = toChildArray(children);
  const numSeats = arrayChildren.length;
  return (
    <>
      {arrayChildren.map((child, index) => {
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
