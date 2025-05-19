"use client";

import {Check, Monitor, Moon, Sun} from "lucide-react";

import {CommandItem, CommandSubtitle} from "@/components/ui/command";
import {useAppContext} from "@/state/app-state";

export function CommandThemes() {
  const {theme, updateTheme, closeCmdK} = useAppContext();

  const handleSelect = (updatedTheme: typeof theme) => {
    updateTheme(updatedTheme);
    closeCmdK();
  };

  return (
    <>
      <CommandItem onSelect={() => handleSelect("light")}>
        <Sun />
        <span>Change to Light</span>

        {theme === "light" && (
          <CommandSubtitle className="shrink-0">
            <Check className="h-4 w-4" />
          </CommandSubtitle>
        )}
      </CommandItem>

      <CommandItem onSelect={() => handleSelect("dark")}>
        <Moon />
        <span>Change to Dark</span>

        {theme === "dark" && (
          <CommandSubtitle className="shrink-0">
            <Check className="h-4 w-4" />
          </CommandSubtitle>
        )}
      </CommandItem>

      <CommandItem onSelect={() => handleSelect("system")}>
        <Monitor />
        <span>Change to system</span>

        {theme === "system" && (
          <CommandSubtitle className="shrink-0">
            <Check className="h-4 w-4" />
          </CommandSubtitle>
        )}
      </CommandItem>
    </>
  );
}
