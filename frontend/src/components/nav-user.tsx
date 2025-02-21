"use client";

import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  MailWarning,
  Lock,
  Building2,
} from "lucide-react";
import { useEffect } from "react";
import { handleAuthResponse } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "@/queries/session";
import { useAppContext } from "@/state/app-state";
import { authClient } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { getOrigin } from "@/lib/constants";
import { router } from "@/main";
import { toast } from "sonner";
import {
  useActiveOrganizationQuery,
  useOrganizationsListQuery,
} from "@/queries/organization";

export function NavUser() {
  const { user, session } = useSession();
  const organizationQuery = useActiveOrganizationQuery();
  const organizationListQuery = useOrganizationsListQuery();
  const { theme, updateTheme } = useAppContext();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut();
      return handleAuthResponse(res);
    },
    onSuccess: () => {
      router.navigate({ to: "/login" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: getOrigin(),
      });
      return handleAuthResponse(res);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.forgetPassword({
        email: user.email,
        redirectTo: `${getOrigin()}/auth/reset-password`,
      });
      return handleAuthResponse(res);
    },
  });

  const switchOrganizationMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await authClient.organization.setActive({
        organizationId,
      });
      return handleAuthResponse(res);
    },
  });

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, updateTheme]);

  const handleLogout = () => {
    toast.promise(() => logoutMutation.mutateAsync(), {
      loading: "Logging out...",
      success: "Logged out successfully",
      error: "Failed to log out",
    });
  };

  const handleVerifyEmail = () => {
    toast.promise(() => verifyEmailMutation.mutateAsync(), {
      loading: "Sending verification email...",
      success: "Verification email sent successfully, please check your email.",
      error: "Failed to send verification email",
      position: "bottom-center",
    });
  };

  const handleResetPassword = async () => {
    toast.promise(() => forgotPasswordMutation.mutateAsync(), {
      loading: "Sending reset password email...",
      success:
        "Reset password email sent successfully, please check your email.",
      error: "Failed to send reset password email",
      position: "bottom-center",
    });
  };

  const handleSwitchOrganization = (organizationId: string) => {
    const promise = switchOrganizationMutation.mutateAsync(organizationId);
    toast.promise(promise, {
      loading: "Switching organization...",
      error: "Failed to switch organization",
      position: "top-center",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-sm">
              <span className="font-medium">{user.name}</span>

              {organizationQuery.isLoading ? (
                <div className="animate-pulse bg-gray-4 w-32 h-4 rounded-md" />
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 />
                  <span>
                    {organizationQuery?.data?.name || "No Organization"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="right">
        {!user.emailVerified && (
          <DropdownMenuItem onClick={handleVerifyEmail}>
            <MailWarning className="mr-2 h-4 w-4" />
            Verify Email
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleResetPassword}>
          <Lock className="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => updateTheme(value as any)}
            >
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Switch organization</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {organizationListQuery.data?.map((org) => (
              <DropdownMenuCheckboxItem
                checked={org.id === session.activeOrganizationId}
                key={org.id}
                onCheckedChange={() => handleSwitchOrganization(org.id)}
              >
                {org.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
