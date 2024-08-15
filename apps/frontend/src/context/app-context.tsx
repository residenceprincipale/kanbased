import { createContext, JSX, useContext } from "solid-js";
import { usePinnedBoards } from "~/hooks/use-pinned-boards";

const AppContext = createContext<AppContext>();

export const AppContextProvider = (props: { children: JSX.Element }) => {
  const pinnedData = usePinnedBoards();

  return (
    <AppContext.Provider value={{ ...pinnedData }}>
      {props.children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext should be used within a AppContextProvider");
  }

  return context;
}

type AppContext = ReturnType<typeof usePinnedBoards>;
