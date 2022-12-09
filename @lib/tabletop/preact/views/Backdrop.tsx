import { ComponentChildren } from "preact";

export function Backdrop({ children }: { children: ComponentChildren }) {
  return (
    <section
      id="tabletop-backdrop"
      class="relative h-full w-full text-white"
      style={{
        background: "radial-gradient(circle,#00850b 20%,#005c09 100%)",
      }}
    >
      {children}
    </section>
  );
}

export default Backdrop;
