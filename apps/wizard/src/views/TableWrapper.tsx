import { ComponentChildren } from "preact";
import { css } from "goober";
import { Dimensions } from "@lib/card-views/types";
import { useWindowSize } from "@lib/premix";

export const tableWrapper = css`
  position: absolute;
  background-color: rgba(0, 0, 0, 0);
  width: 100%;
`;

export const TableWrapper = ({
  children,
  getTableDimensions,
}: {
  children?: ComponentChildren;
  getTableDimensions: (width: number, height: number) => Dimensions;
}) => {
  const [innerWidth, innerHeight] = useWindowSize();
  const { h } = getTableDimensions(innerWidth, innerHeight);
  return (
    <div className={`${tableWrapper}`} style={{ height: `${h}px` }}>
      {children}
    </div>
  );
};
