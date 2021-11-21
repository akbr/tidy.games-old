export type Els = Element | Element[];
export type RawStylesBlock = {
  [key: string]: string | number | FnValue<string | number>;
};
export type StylesInput =
  | RawStylesBlock
  | RawStylesBlock[]
  | FnValue<RawStylesBlock | RawStylesBlock[]>;
export type Options = RawStylesBlock | FnValue<RawStylesBlock>;
export type Styles = { [key: string]: string | number };
export type FnValue<T> = (idx: number, length: number) => T;
