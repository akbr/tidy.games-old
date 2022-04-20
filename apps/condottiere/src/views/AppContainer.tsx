import type { ComponentChildren } from "preact";

export function AppContainer({ children }: { children: ComponentChildren }) {
  return (
    <section
      type="AppContainer"
      class="h-full w-full max-w-[650px]"
      style={{
        background: "radial-gradient(circle,#c2b280 10%,#7d6d3c 100%)",
      }}
    >
      {children}
    </section>
  );
}
export default AppContainer;
