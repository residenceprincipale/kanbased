export const routeMap = {
  home: "/",
  boards: "/boards",
  board: (boardId: string) => `${routeMap.boards}/${boardId}` as const,
  login: "/auth/login",
  register: "/auth/register",
} as const;

export enum QueryParamState {
  CreateColumn = "create-column",
  UpdateBoard = "update-board",
}

export function getOrigin() {
  // TODO: Revisit this if we are doing SSR.
  const origin = window.location.origin;

  // Remove trailing slash from origin if it exists.
  if (origin[origin.length - 1] === "/") {
    return origin.slice(0, -1);
  }

  return origin;
}

export const isMac =
  typeof window !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

