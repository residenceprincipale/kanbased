"use client";

import {ChevronsUpDown, Mail, Plus, UserRound} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {Link} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {handleAuthResponse} from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuthData} from "@/queries/session";
import {authClient} from "@/lib/auth";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {getOrganizationListQuery} from "@/lib/zero-queries";
import {useZ} from "@/lib/zero-cache";
import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import {InviteMemberDialog} from "@/features/user/invite-member";
import OrgAvatar from "@/components/org-avatar";

export function NavOrganization() {
  const userData = useAuthData();
  const z = useZ();
  const {isMobile} = useSidebar();
  const [organizationsList] = useQuery(getOrganizationListQuery(z));
  const currentOrganization = organizationsList.find(
    (org) => org.id === userData.activeOrganizationId,
  );

  const switchOrganizationMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await authClient.organization.setActive({
        organizationId,
      });
      return handleAuthResponse(res);
    },
    onSuccess: () => {
      localStorage.removeItem("auth-token");
      window.location.href = "/";
    },
  });

  const handleSwitchOrganization = (organizationId: string) => {
    const promise = switchOrganizationMutation.mutateAsync(organizationId);
    toast.promise(promise, {
      loading: "Switching organization...",
      error: "Failed to switch organization",
      position: "top-center",
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-0!"
              >
                <OrgAvatar name={currentOrganization?.name ?? ""} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium truncate">
                    {currentOrganization?.name}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto h-4 w-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              side={isMobile ? "bottom" : "right"}
            >
              <DropdownMenuLabel>Organization</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/new-organization">
                  <Plus className="mr-2 h-4 w-4" />
                  Create new organization
                </Link>
              </DropdownMenuItem>

              <DialogTrigger asChild>
                <DropdownMenuItem className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Invite member
                </DropdownMenuItem>
              </DialogTrigger>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserRound className="mr-2 h-4 w-4" />
                  Switch organization
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {organizationsList.map((org) => (
                    <DropdownMenuCheckboxItem
                      checked={org.id === userData.activeOrganizationId}
                      key={org.id}
                      onCheckedChange={() => handleSwitchOrganization(org.id)}
                    >
                      {org.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>

          <InviteMemberDialog />
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
