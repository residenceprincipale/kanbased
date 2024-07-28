import { JSX } from "solid-js";
import { Topbar } from "~/components/topbar";

export default function HomeRouteLayout(props: { children?: JSX.Element }) {
  return (
    <div>
      <Topbar />
      {props.children}
    </div>
  );
}
