import { css } from "goober";
import { getSeatRatio } from "@lib/layouts/seats";
import { FunctionalComponent, toChildArray } from "preact";

const getTranslateAdjustment = (ratio: number) =>
  ratio === 0 ? 0 : ratio === 1 ? -100 : -50;

const getClass = ([xRatio, yRatio]: number[]) =>
  css({
    position: "absolute",
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
      {arrayChildren.map((child, index) => (
        <div className={getClass(getSeatRatio(numSeats, index))}>{child}</div>
      ))}
    </>
  );
};
