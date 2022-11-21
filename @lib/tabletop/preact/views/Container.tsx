import { ComponentChildren } from "preact";

export default function DefaultAppContainer({
  children,
}: {
  children: ComponentChildren;
}) {
  return (
    <section
      type="AppContainer"
      class="relative h-full w-full"
      style={{
        background: "radial-gradient(circle,#00850b 20%,#005c09 100%)",
      }}
    >
      {children}
    </section>
  );
}
