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
import {DialogTrigger} from "@/components/ui/dialog";
import {Dialog} from "@/components/ui/dialog";
import {InviteMemberDialog, RoleSelect} from "@/features/user/invite-member";

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

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Invite Member
              </Button>
            </DialogTrigger>

            <InviteMemberDialog />
          </Dialog>
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
                <RoleSelect
                  value={member.role}
                  onChange={(role) => {
                    console.log(role);
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
