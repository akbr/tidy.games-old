export function getTranslateValues(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const matrix = style["transform"];

  // No transform property. Simply return 0 values.
  if (matrix === "none" || typeof matrix === "undefined") {
    return {
      x: 0,
      y: 0,
    };
  }

  //@ts-ignore
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
  return {
    x: parseInt(matrixValues[4], 10),
    y: parseInt(matrixValues[5], 10),
  };
}
