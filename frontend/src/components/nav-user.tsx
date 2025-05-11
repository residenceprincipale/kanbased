"use client";

import {
  ChevronsUpDown,
  Lock,
  LogOut,
  MailWarning,
  Settings,
} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {handleAuthResponse} from "@/lib/utils";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuthData} from "@/queries/session";
import {authClient} from "@/lib/auth";
import {getOrigin} from "@/lib/constants";
import {router} from "@/main";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {useZ} from "@/lib/zero-cache";
import {Dialog, DialogTitle} from "@/components/ui/dialog";
import {InviteMemberDialog} from "@/features/user/invite-member";
import {useState} from "react";
import {UserSettings} from "@/features/user/user-settings";

export function NavUser() {
  const userData = useAuthData();
  const z = useZ();
  const [showUserSettings, setShowUserSettings] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut();
      return handleAuthResponse(res);
    },
    onSuccess: () => {
      localStorage.removeItem("auth-token");
      router.navigate({to: "/login", reloadDocument: true});
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.sendVerificationEmail({
        email: userData.email,
        callbackURL: getOrigin(),
      });
      return handleAuthResponse(res);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.forgetPassword({
        email: userData.email,
        redirectTo: `${getOrigin()}/reset-password`,
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
    onSuccess: () => {
      localStorage.removeItem("auth-token");
      window.location.href = "/";
    },
  });

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

  const handleResetPassword = () => {
    toast.promise(() => forgotPasswordMutation.mutateAsync(), {
      loading: "Sending reset password email...",
      success:
        "Reset password email sent successfully, please check your email.",
      error: "Failed to send reset password email",
      position: "top-center",
    });
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-0!"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.image} alt={userData.name} />
                    <AvatarFallback>{userData.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-medium truncate">
                      {userData.name}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="right">
                {!userData.emailVerified && (
                  <DropdownMenuItem onClick={handleVerifyEmail}>
                    <MailWarning className="mr-2 h-4 w-4" />
                    Verify Email
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleResetPassword}>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setShowUserSettings(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <InviteMemberDialog />
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
      {showUserSettings && (
        <UserSettings onClose={() => setShowUserSettings(false)} />
      )}
    </>
  );
}
