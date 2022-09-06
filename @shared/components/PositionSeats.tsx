import { ComponentChildren, toChildArray } from "preact";
import { rotateArray } from "@lib/array";
import { getSeatRatio, getStyle } from "@shared/domEffects/positionSeats";

export const PositionSeats = ({
  children,
  perspective,
}: {
  children: ComponentChildren;
  perspective: number;
}) => {
  const childArray = rotateArray(toChildArray(children), -perspective);
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
