import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandSeparator,
  Command,
} from "@/components/ui/command";
import {CommandOrgSwitch} from "@/features/cmd-k/cmd-org-switch";
import {useHotkeys} from "react-hotkeys-hook";
import {useAppContext} from "@/state/app-state";

export function OrganizationDedicatedSwitch() {
  const {isOrgSwitchOpen, openOrgSwitch, closeOrgSwitch} = useAppContext();

  useHotkeys(
    "mod+o",
    () => {
      openOrgSwitch();
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
    [isOrgSwitchOpen],
  );

  return (
    <CommandDialog open={isOrgSwitchOpen} onOpenChange={closeOrgSwitch}>
      <Command>
        <CommandInput placeholder="Search for workspace..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandSeparator />
          <CommandOrgSwitch />
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
