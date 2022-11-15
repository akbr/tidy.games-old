import { ComponentChildren } from "preact";

export default function DefaultBackrop({
  children,
}: {
  children: ComponentChildren;
}) {
  return (
    <section
      type="Backdrop"
      class="h-full w-full flex justify-center bg-[#2a1b0e]"
    >
      {children}
    </section>
  );
}
