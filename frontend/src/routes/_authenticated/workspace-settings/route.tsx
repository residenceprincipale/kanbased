import {useZ} from "@/lib/zero-cache";
import {
  getOrganizationQuery,
  getOrganizationMembersQuery,
} from "@/lib/zero-queries";
import {useActiveOrganizationId} from "@/queries/session";
import {useQuery} from "@rocicorp/zero/react";
import {createFileRoute} from "@tanstack/react-router";
import UserAvatar from "@/components/user-avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import OrgAvatar from "@/components/org-avatar";
import {Button} from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/workspace-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const orgId = useActiveOrganizationId();
  const z = useZ();
  const [myOrg] = useQuery(getOrganizationQuery(z, orgId));
  const [members] = useQuery(getOrganizationMembersQuery(z, orgId));

  if (!myOrg) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card className="mb-8 border shadow-md">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <OrgAvatar
            name={myOrg?.name}
            imageUrl={myOrg?.logo}
            className="size-16"
          />
          <div>
            <CardTitle className="text-2xl font-bold mb-1">
              {myOrg?.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Workspace ID:{" "}
              <span className="font-mono text-sm px-1 py-0.5">{myOrg.id}</span>
            </CardDescription>
            <CardDescription className="text-sm text-muted-foreground">
              Created at:{" "}
              <span className="font-mono text-sm px-1 py-0.5">
                {new Date(myOrg.createdAt).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Team Members ({members.length})</CardTitle>
            <CardDescription>
              Invite your team members to collaborate.
            </CardDescription>
          </div>

          <Button size="sm" variant="outline">
            Invite Member
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition"
              >
                <UserAvatar
                  name={member.user?.name || "?"}
                  imageUrl={member.user?.image ?? undefined}
                  className="w-12 h-12"
                />
                <div className="flex-1">
                  <div className="font-medium text-base">
                    {member.user?.name}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {member.user?.email}
                  </div>
                </div>
                <div className="relative w-[110px]">
                  <select
                    value={member.role}
                    className="appearance-none border rounded px-2 py-1 bg-muted-foreground/10 w-full pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 8L10 12L14 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <style>{`
        select::-ms-expand { display: none; }
        select {
          background: none;
        }
      `}</style>
    </div>
  );
}
