"use client";

import {Check, Building2} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";

import {CommandItem, CommandSubtitle} from "@/components/ui/command";
import {useAppContext} from "@/state/app-state";
import {useQuery} from "@rocicorp/zero/react";
import {useZ} from "@/lib/zero-cache";
import {getOrganizationListQuery} from "@/lib/zero-queries";
import {useAuthData} from "@/queries/session";
import {authClient} from "@/lib/auth";
import {handleAuthResponse} from "@/lib/utils";
import OrgAvatar from "@/components/org-avatar";

export function CommandOrgSwitch() {
  const {closeCmdK} = useAppContext();
  const z = useZ();
  const userData = useAuthData();
  const [organizationsList] = useQuery(getOrganizationListQuery(z));

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
    closeCmdK();
  };

  return (
    <>
      {organizationsList.map((org) => (
        <CommandItem
          key={org.id}
          onSelect={() => handleSwitchOrganization(org.id)}
        >
          <OrgAvatar name={org.name} imageUrl={org.logo} />
          <span>Switch to {org.name}</span>
          {org.id === userData.activeOrganizationId && (
            <CommandSubtitle className="shrink-0">
              <Check className="h-4 w-4" />
            </CommandSubtitle>
          )}
        </CommandItem>
      ))}
    </>
  );
}
