import { GameProps } from "./types";
import { ComponentChildren } from "preact";
import { rotateArray } from "@lib/array";

const getScore = (bid: number, actual: number) => {
  const diff = Math.abs(bid - actual);
  return diff === 0 ? 20 : diff * -10;
};

const convert = (scores: number[][]) => {
  let rows: number[][][] = [];

  let runningTotal = scores[0].map(() => 0);
  let thisBids: number[];
  let thisActuals: number[];

  scores.forEach((x, idx) => {
    if (idx % 2 === 0) {
      thisBids = x;
      return;
    }

    thisActuals = x;

    let columns = thisBids.map((bid, playerIndex) => {
      let actual = thisActuals[playerIndex];
      let score = getScore(bid, actual);
      runningTotal[playerIndex] += score;
      return [runningTotal[playerIndex], bid, actual];
    });

    rows.push(columns);
  });

  return rows;
};

const PlayerHead = ({ children }: { children: ComponentChildren }) => (
  <th scope={"col"} colSpan={3}>
    {children}
  </th>
);

const PlayerCells = ([score, bid, actual]: number[]) => {
  const backgroundColor = bid === actual ? "#90EE90" : "#F08080";
  return (
    <>
      <td style={{ backgroundColor }}>{score}</td>
      <td>{bid}</td>
      <td>{actual}</td>
    </>
  );
};

const PlayerRow = ({ columns }: { columns: number[][] }) => (
  <tr>{columns.map(PlayerCells)}</tr>
);

export const ScoreTable = ({
  frame: {
    player,
    state: [type, { scores }],
  },
  room,
}: GameProps) => {
  if (scores.length === 0) return <div>No scores yet</div>; // this is because inital scores is [] rather than [[]]. fix in reducer.

  let avatars = room.seats.map(({ avatar }) => avatar);

  avatars = rotateArray(avatars, -player);
  let table = convert(scores.map((row) => rotateArray(row, -player)));

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ marginBottom: "8px" }}>Scores</h2>
      {/** @ts-ignore  */}
      <table border={"1"} style={{ backgroundColor: "#fff", color: "black" }}>
        <tr>
          {avatars.map((icon) => (
            <PlayerHead>{icon}</PlayerHead>
          ))}
        </tr>
        {table.map((columns) => (
          <PlayerRow columns={columns} />
        ))}
      </table>
    </div>
  );
};
