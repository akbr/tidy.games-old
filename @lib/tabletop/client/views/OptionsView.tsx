import { Cart } from "@lib/tabletop/cart";
import { Spec } from "@lib/tabletop/spec";
import { useEffect, useState } from "preact/hooks";

export type OptionsView<S extends Spec> = (props: {
  options: S["options"];
  setOptions: (options: S["options"]) => void;
  numPlayers: number;
}) => JSX.Element;

export type OptionsWrapperProps<S extends Spec> = {
  OptionsView: OptionsView<S>;
  options: S["options"];
  setOptions: (options: S["options"]) => void;
  numPlayers: number;
};

export const OptionsWrapper = <S extends Spec>({
  OptionsView,
  options,
  setOptions,
  numPlayers,
}: OptionsWrapperProps<S>) => {
  useEffect(() => {
    setOptions(options);
  }, [numPlayers]);

  return (
    <OptionsView
      options={options}
      setOptions={setOptions}
      numPlayers={numPlayers}
    />
  );
};
