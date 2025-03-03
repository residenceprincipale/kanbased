import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/queries/session";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Markdown from "@/components/markdown";

export const Route = createFileRoute("/_authenticated/_layout/")({
  component: HomeComponent,
});

function HomeComponent() {
  const session = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Welcome, {session.user.name}! 👋
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            Get started by managing your boards or creating a new one.
          </p>
          <Link to="/boards">
            <Button size="lg">Go to Boards</Button>
          </Link>
        </CardContent>
      </Card>

      <Markdown />
    </div>
  );
}
