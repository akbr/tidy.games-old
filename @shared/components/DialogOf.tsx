import { useRefreshOnResize } from "@lib/hooks";
import { ComponentChildren } from "preact";

export const DialogOf = ({
  close,
  children,
}: {
  close: () => void;
  children: ComponentChildren;
}) => {
  useRefreshOnResize();

  return (
    <div class="absolute top-0 w-full h-full flex items-center justify-center">
      <div
        class="absolute w-full h-full bg-black bg-opacity-50"
        style={{ zIndex: 9999 }}
        onClick={() => close()}
      />
      <div
        style={{ zIndex: 9999 }}
        class="relative max-w-[calc(90%)] max-h-[calc(90%)] bg-blue-200 rounded pointer-events-auto p-1 text-black "
      >
        <div
          class="absolute rounded top-[-12px] right-[-12px] bg-red-700 cursor-pointer p-0.5 "
          onClick={() => close()}
          style={{ zIndex: 9999 }}
        >
          <svg
            display="block"
            stroke="white"
            fill="white"
            stroke-width="0"
            viewBox="0 0 352 512"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
          </svg>
        </div>
        <div
          class="relative overflow-y-auto overflow-x-auto"
          style={{ maxHeight: window.innerHeight * 0.89 }}
        >
          <div class="rounded p-2">{children}</div>
        </div>
      </div>
    </div>
  );
};
