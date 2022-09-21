import { FunctionalComponent } from "preact";

export const Field: FunctionalComponent<{ legend: string }> = ({
  legend,
  children,
}) => {
  return (
    <fieldset class="p-3 border-0 bg-black bg-opacity-40 rounded">
      <legend class="font-bold">{legend}</legend>
      {children}
    </fieldset>
  );
};

export default Field;
