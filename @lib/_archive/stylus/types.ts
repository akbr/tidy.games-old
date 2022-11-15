export type Value = string | number;

interface BaseStyles
  extends Omit<CSSStyleDeclaration, "direction" | "transition"> {}

interface TransformShorthands {
  x?: Value;
  y?: Value;
  scale?: Value;
  rotate?: Value;
}

export type SingleFrame = {
  [K in keyof BaseStyles]?: Value | Value[];
} & TransformShorthands;

export type MultiFrame = {
  [K in keyof BaseStyles]?: Value;
} & TransformShorthands;

export type Options = {
  [K in keyof KeyframeAnimationOptions]?: Value;
};
