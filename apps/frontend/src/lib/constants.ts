export const routeMap = {
  home: "/",
  boards: "/boards",
  board: (boardId: string) => `${routeMap.boards}/${boardId}`,
  login: "/auth/login",
  register: "/auth/register",
};
