import { routeMap } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const routeCtx = Route.useRouteContext();
  const user = routeCtx.auth?.user;

  return (
    <div className="flex height-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2">Kanbased</h1>
          <p className="text-xl">Fast, Minimalistic, personal kanban app.</p>
        </header>

        <div>
          <h2 className="mb-4">
            Welcome <span className="font-medium">{user?.displayName}!</span>{" "}
          </h2>
          <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
            <h2>Quick links</h2>
            <ul>
              {resources.map(({ href, text, icon }) => (
                <li key={href}>
                  <Link
                    className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    to={href}
                    rel="noreferrer"
                  >
                    {icon}
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

const resources = [
  {
    href: routeMap.boards,
    text: "Boards",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M8.51851 12.0741L7.92592 18L15.6296 9.7037L11.4815 7.33333L12.0741 2L4.37036 10.2963L8.51851 12.0741Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];
