import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
type AppContextValues = {
  theme: Theme;
  updateTheme: (theme: Theme) => void;
};

const AppContext = createContext<AppContextValues>({} as AppContextValues);

export function AppContextProvider(props: React.PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => {
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? "dark" : "light";
  });

  const updateTheme = (value: Theme) => {
    const htmlElement = document.documentElement;
    if (value === "dark") {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    setTheme(value);
    localStorage.setItem("theme", value);
  };

  return (
    <AppContext.Provider value={{ theme, updateTheme }}>
      {props.children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext should be used within AppContextProvider");
  }

  return context;
}
