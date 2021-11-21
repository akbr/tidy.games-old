import { styled } from "goober";
import { useState, useCallback, useEffect } from "preact/hooks";

const Container = styled("div")`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Error = styled("div")`
  display: inline-block;
  background-color: red;
  padding: 6px;
  border-radius: 4px;
`;

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

  return <Error>{err.data}</Error>;
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
    <Container>
      {errors.map((err) => (
        <TimedError key={err} err={err} remove={remove} />
      ))}
    </Container>
  );
};
