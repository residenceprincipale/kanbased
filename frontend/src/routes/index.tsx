import { routeMap } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useSession } from "@/queries/session";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const session = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Kanbased
            </h1>
            <p className="text-xl text-muted-foreground">
              Fast, Minimalistic, Personal Kanban App
            </p>
          </div>

          {/* Main Content */}
          {session?.user ? (
            // Logged in state
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-medium mb-4">
                  Welcome back,{" "}
                  <span className="text-primary">
                    {session?.user.displayName}
                  </span>
                  !
                </h2>
                <Link to={routeMap.boards}>
                  <Button size="lg" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Boards
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Not logged in state
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Get started with your personal Kanban boards today
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/auth/login">
                  <Button size="lg" variant="default" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="lg" variant="outline" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-4 border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Simple & Fast",
    description:
      "Clean interface focused on productivity with zero distractions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    ),
  },
  {
    title: "Personal Boards",
    description: "Create and manage multiple boards for different projects",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    title: "Task Management",
    description:
      "Organize tasks with customizable columns and easy drag-and-drop",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </svg>
    ),
  },
];
