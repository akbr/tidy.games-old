type Value = string | number;
type ValueFn = (idx: number, length: number) => Value;
type Input = Value | ValueFn;

interface CSSStyleDeclarationWithTransforms extends CSSStyleDeclaration {
  x: string;
  y: string;
  s: string;
  r: string;
}

export type Styles = {
  [key in keyof CSSStyleDeclarationWithTransforms]?: Input;
};

export type Options = {
  [key in keyof KeyframeAnimationOptions]?: Input;
};

export type Resolvable = Record<string, Input | undefined>;
