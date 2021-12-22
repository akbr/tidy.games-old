import { EngineTypes } from "@lib/io/engine";
import { ServerOutputs } from "@lib/io/server/types";

const colors = {
  engine: "bg-purple-700",
  engineMsg: "bg-red-700",
  server: "bg-yellow-700",
  serverMsg: "bg-red-500",
};

export const ResStream = <ET extends EngineTypes>({
  resArr,
}: {
  resArr: ServerOutputs<ET>[];
}) => {
  return (
    <div class="flex gap-2 overflow-x-auto p-2">
      {resArr.map((res) => (
        <ResItem res={res} />
      ))}
    </div>
  );
};

const ResItem = <ET extends EngineTypes>({
  res,
}: {
  res: ServerOutputs<ET>;
}) => {
  let color = colors[res.type];
  return (
    <div class={`inline-block p-2 rounded-md ${color}`}>
      <pre class="font-bold pb-2">{res.type}</pre>
      <JSONDisplay obj={res.data} />
    </div>
  );
};

export const JSONDisplay = ({ obj }: { obj: Record<string, any> }) => (
  <pre class="">{JSON.stringify(obj, undefined, 1)}</pre>
);
