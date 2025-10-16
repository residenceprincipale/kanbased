import {
  Outlet,
  createFileRoute,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useCallback, useEffect, useMemo, useState} from "react";
import {ZeroProvider} from "@/lib/zero-provider";
import {AuthError, createId} from "@/lib/utils";
import {authQueryOptions} from "@/lib/query-options-factory";
import {queryClient} from "@/lib/query-client";
import {preloadAllBoards} from "@/lib/zero-queries";
import {authClient} from "@/lib/auth";
import {router} from "@/main";
import {useAuthData} from "@/queries/session";
import {useZ} from "@/lib/zero-cache";

const clearAndRedirectToHome = async (newUser?: boolean) => {
  localStorage.removeItem("auth-token");
  await queryClient.invalidateQueries(authQueryOptions, {
    throwOnError: true,
  });

  router.navigate({
    to: "/",
    reloadDocument: true,
    search: {
      newUser,
    },
  });
};

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  errorComponent: (error) => {
    const router = useRouter();

    if (error.error instanceof AuthError) {
      router.navigate({
        to: "/login",
        reloadDocument: true,
        search: {
          redirect: location.href,
        },
      });

      return null;
    }

    return (
      <div className="h-screen flex items-center justify-center">
        <div className="max-w-96">
          <p className="text-destructive text-2xl font-bold mb-2">
            {error.error.message}
          </p>
          <p className="text-destructive">
            Something went wrong, Try refreshing the page.
          </p>
        </div>
      </div>
    );
  },
  validateSearch: (search): {newUser?: boolean} => {
    return {
      newUser: typeof search.newUser === "boolean" ? search.newUser : undefined,
    };
  },
});

function RouteComponent() {
  const {
    data: {decodedData},
  } = useSuspenseQuery(authQueryOptions);
  const router = useRouter();
  const pathName = useLocation({select: (location) => location.pathname});
  const [error, setError] = useState("");

  const redirectToLogin = () => {
    localStorage.removeItem("auth-token");
    router.navigate({
      to: "/login",
      reloadDocument: true,
      search: {
        redirect: location.href,
      },
    });
  };

  const currentTime = Math.floor(Date.now() / 1000);
  const isAuthExpired = currentTime >= decodedData.exp;

  if (isAuthExpired) {
    redirectToLogin();

    return null;
  }

  const hasActiveOrganization = decodedData.activeOrganizationId;

  const handleNoActiveOrganization = async () => {
    if (pathName.includes("/new-workspace")) return;

    const {data: orgList} = await authClient.organization.list();

    // If there is an active organization, set it as active and redirect to home
    if (orgList && orgList.length > 0) {
      const {error} = await authClient.organization.setActive({
        organizationId: orgList[0]!.id,
      });

      if (error) {
        setError("Something went wrong, Try refreshing the page.");
        return;
      }

      await clearAndRedirectToHome();
      return;
    }

    const hasName = decodedData.name && decodedData.name.length > 0;

    // If the user has a name, create a new organization and set it as active
    if (hasName) {
      const {data, error} = await authClient.organization.create({
        name: `${decodedData.name!.split(" ")[0]}'s Workspace`,
        slug: `${decodedData.name!.toLowerCase().replace(" ", "-")}-workspace`,
      });

      if (error) {
        router.navigate({
          to: "/new-workspace",
        });
        return;
      }

      const activeOrgRes = await authClient.organization.setActive({
        organizationId: data.id,
      });

      if (activeOrgRes.error) {
        setError("Something went wrong, Try refreshing the page.");
        return;
      }

      await clearAndRedirectToHome(true);
    } else {
      router.navigate({
        to: "/new-workspace",
      });
    }
  };

  if (error) {
    throw new Error(error);
  }

  if (!hasActiveOrganization) {
    handleNoActiveOrganization();
    return null;
  }

  // Temporarily bypass Zero to test auth/org flow
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border rounded-lg p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4">✅ Authentication & Organization Working!</h1>
          <div className="space-y-2">
            <p><strong>User:</strong> {decodedData.name} ({decodedData.email})</p>
            <p><strong>User ID:</strong> <code className="text-xs">{decodedData.id}</code></p>
            <p><strong>Organization ID:</strong> <code className="text-xs">{decodedData.activeOrganizationId}</code></p>
            <p><strong>Role:</strong> {decodedData.role || 'Not set'}</p>
            <p><strong>Email Verified:</strong> {decodedData.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-6">
          <h2 className="font-bold mb-2">Next Step: Set up Zero Cache</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The app needs Zero cache for real-time sync and data management.
          </p>
          <div className="text-xs space-y-1">
            <p><strong>Frontend env:</strong> CLIENT_PUBLIC_SERVER={import.meta.env.CLIENT_PUBLIC_SERVER || 'NOT SET'}</p>
            <p><strong>Expected:</strong> http://kanbased-zero-yvvdth:4848 (or your Zero container URL)</p>
          </div>
          <button
            onClick={async () => {
              await authClient.signOut();
              window.location.href = '/login';
            }}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceInitializer({children}: {children: React.ReactNode}) {
  const authData = useAuthData();
  const {newUser} = Route.useSearch();
  const z = useZ();

  useEffect(() => {
    preloadAllBoards(z);
  }, [z]);

  const createDefaultBoard = useCallback(async () => {
    // Create a default board for the newly created organization
    await z.mutateBatch(async (m) => {
      const boardId = createId();

      await m.boardsTable.insert({
        id: boardId,
        name: "Getting Things Done",
        slug: "getting-things-done",
        organizationId: authData.activeOrganizationId,
        creatorId: authData.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const firstColumnId = createId();

      // Create a default column for the newly created board
      await m.columnsTable.insert({
        id: firstColumnId,
        name: "To Do",
        boardId,
        position: 0,
        creatorId: authData.id,
        organizationId: authData.activeOrganizationId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await m.columnsTable.insert({
        id: createId(),
        name: "Doing",
        boardId,
        position: 1,
        creatorId: authData.id,
        organizationId: authData.activeOrganizationId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await m.columnsTable.insert({
        id: createId(),
        name: "Done",
        boardId,
        position: 2,
        creatorId: authData.id,
        organizationId: authData.activeOrganizationId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await m.tasksTable.insert({
        id: createId(),
        name: "👋 Welcome to your board! Move this task to 'Done' to complete your first action.",
        columnId: firstColumnId,
        position: 1000,
        creatorId: authData.id,
        organizationId: authData.activeOrganizationId,
        content: `
# Welcome to KanBased! 👋

This is a **minimal** and **distraction-free** Kanban app built to help you focus on what matters.


✨ **Keyboard-first experience**  
Navigate and manage tasks quickly without touching the mouse.  
_Pay attention to keyboard shortcuts, they make everything faster._


🎯 Start by:
- Creating your own tasks
- Moving them across columns with drag or shortcuts
- Exploring what works best for your flow

---


✅ Ready? Move this task to **Done** to begin.

        `,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  }, [authData.activeOrganizationId, authData.id, z]);

  useEffect(() => {
    if (newUser) {
      createDefaultBoard().then(() => {
        router.navigate({
          to: "/",
          search: {
            newUser: undefined,
          },
          replace: true,
        });
      });
    }
  }, [newUser, createDefaultBoard, router]);

  return children;
}
