import {
  Outlet,
  createFileRoute,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useCallback, useEffect, useMemo, useState} from "react";
import {ZeroProvider} from "@rocicorp/zero/react";
import {AuthError, createId} from "@/lib/utils";
import {authQueryOptions} from "@/lib/query-options-factory";
import {queryClient} from "@/lib/query-client";
import {preloadAllBoards} from "@/lib/zero-queries";
import {createZeroCache} from "@/lib/zero-cache";
import {authClient} from "@/lib/auth";
import {router} from "@/main";
import {useAuthData} from "@/queries/session";

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

  return (
    <ZeroWrapped>
      <Outlet />
    </ZeroWrapped>
  );
}

function ZeroWrapped({children}: {children: React.ReactNode}) {
  const authData = useAuthData();
  const z = useMemo(
    () => createZeroCache({userId: authData.id}),
    [authData.id],
  );
  const {newUser} = Route.useSearch();

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

  return <ZeroProvider zero={z}>{children}</ZeroProvider>;
}
