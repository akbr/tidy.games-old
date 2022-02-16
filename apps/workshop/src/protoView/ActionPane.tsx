const App = ({
  numPlayers,
  actions,
}: {
  numPlayers: number;
  actions: Record<string, Function>;
}) => {
  const ref = useRef<HTMLSelectElement>(null);
  const getPlayer = () => (ref.current ? parseInt(ref.current.value) : 0);

  return (
    <div>
      <span>As player: </span>
      <select ref={ref}>
        {Array.from({ length: numPlayers }).map((_, idx) => {
          return <option value={`${idx}`}>{idx}</option>;
        })}
      </select>
      <div>
        {Object.entries(actions).map(([key, fn]) => (
          <div>
            <input style={{ width: "32px" }} />
            <button onClick={() => console.log(key, getPlayer())}>{key}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
