export const routeMap = {
  home: "/",
  boards: "/boards",
  board: (boardId: string) => `${routeMap.boards}/${boardId}` as const,
  login: "/auth/login",
  register: "/auth/register",
} as const;



export enum QueryParamState {
  CreateColumn = "create-column",
  UpdateBoard = "update-board"
}