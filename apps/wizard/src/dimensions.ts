import { getHandHeight } from "@lib/layouts/hand";

export const xPeek = 35;
export const yPeek = 60;

export const getDimensions = (handLength: number) => {
  const { width, height } = document
    .getElementById("app")!
    .getBoundingClientRect();

  const handHeight = getHandHeight(handLength, width, xPeek, yPeek);

  return {
    appDimensions: [width, height],
    tableDimensions: [width, height - handHeight],
    handDimensions: [width, handHeight],
  };
};
