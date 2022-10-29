import { useTable } from "../state/";

export function Assets() {
  const assets = useTable((x) => x.board.assets);
  return (
    <section id="assets" class="absolute top-0 right-0 p-1 text-center">
      ${assets[0]}
    </section>
  );
}
