import { useState, useCallback, useEffect } from "preact/hooks";

type Err = { type: string; data: string };

const TimedError = ({
  err,
  remove,
}: {
  err: Err;
  remove: (err: Err) => void;
}) => {
  useEffect(() => {
    let timeout = setTimeout(() => {
      remove(err);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [err]);

  return <div class="inline-block bg-red-600 p-2 rounded-lg">{err.data}</div>;
};

export const ErrorReciever = ({ err }: { err: Err | null }) => {
  const [errors, setErrors] = useState<Err[]>([]);

  useEffect(() => {
    if (err === null) return;
    setErrors((errs) => [...errs, err]);
  }, [err]);

  const remove = useCallback(
    (err: Err) => setErrors((errs) => errs.filter((x) => x !== err)),
    [setErrors]
  );

  return (
    <div class="flex flex-col gap-4">
      {errors.map((err) => (
        <TimedError key={err} err={err} remove={remove} />
      ))}
    </div>
  );
};
