import { JSX } from "solid-js";
import { Loader } from "./loader";
import { cn } from "~/lib/utils";

export function OverlayLoader(props: { children: JSX.Element; show: boolean }) {
  return (
    <div
      class={cn(
        "fixed left-1/2 -translate-x-1/2 top-0 transition-transform duration-300",
        props.show ? "translate-y-8" : "-translate-y-full"
      )}
    >
      <div class="flex items-center gap-1.5 h-fit px-5 py-3 rounded-lg shadow-md w-fit text-sm border">
        <Loader />
        <span>{props.children}</span>
      </div>
    </div>
  );
}
