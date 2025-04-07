import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/queries/session";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_layout/")({
  component: HomeComponent,
});

function HomeComponent() {
  const session = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary mt-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl text-center font-bold">
            Welcome, {session.user.name}! 👋
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pt-4">
          <p className="mb-8 text-muted-foreground text-lg">
            What would you like to work on today?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Link to="/boards" className="w-full">
              <Button
                size="lg"
                className="w-full h-20 text-lg flex flex-col gap-1"
                variant="default"
              >
                <span>📋 Boards</span>
                <span className="text-xs font-normal">
                  Manage your kanban boards
                </span>
              </Button>
            </Link>

            <Link to="/notes" className="w-full">
              <Button
                size="lg"
                className="w-full h-20 text-lg flex flex-col gap-1"
                variant="outline"
              >
                <span>📝 Notes</span>
                <span className="text-xs font-normal">Access your notes</span>
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardContent className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4 text-center">
            Toast Varieties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="default"
              onClick={() => toast.success("This is a success toast!")}
            >
              <span>✅ Success Toast</span>
              <span className="text-xs font-normal">
                Shows a success message
              </span>
            </Button>

            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="destructive"
              onClick={() => toast.error("This is an error toast!")}
            >
              <span>❌ Error Toast</span>
              <span className="text-xs font-normal">
                Shows an error message
              </span>
            </Button>

            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="outline"
              onClick={() => toast.info("This is an info toast!")}
            >
              <span>ℹ️ Info Toast</span>
              <span className="text-xs font-normal">Shows an info message</span>
            </Button>

            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="secondary"
              onClick={() => toast.warning("This is a warning toast!")}
            >
              <span>⚠️ Warning Toast</span>
              <span className="text-xs font-normal">
                Shows a warning message
              </span>
            </Button>

            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="outline"
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 50000000)),
                  {
                    loading: "Loading...",
                    success: "Promise resolved successfully!",
                    error: "Promise rejected!",
                  },
                )
              }
            >
              <span>⏳ Promise Toast</span>
              <span className="text-xs font-normal">
                Shows loading, success, and error states
              </span>
            </Button>

            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="outline"
              onClick={() =>
                toast("This is a default toast!", {
                  position: "top-center",
                  duration: 5000,
                })
              }
            >
              <span>📝 Default Toast</span>
              <span className="text-xs font-normal">
                Shows a default message with custom position
              </span>
            </Button>

            <Button
              size="lg"
              className="w-full h-20 text-lg flex flex-col gap-1"
              variant="outline"
              onClick={() =>
                toast("Would you like to continue?", {
                  action: {
                    label: "Confirm",
                    onClick: () => console.log("Action confirmed!"),
                  },
                })
              }
            >
              <span>🔘 Action Toast</span>
              <span className="text-xs font-normal">
                Shows a toast with action buttons
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
