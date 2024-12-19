"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { routeMap } from "@/lib/constants";
import { useAppContext } from "@/state/app-state";
import { Link } from "@tanstack/react-router";
import { House } from "lucide-react";

export function TopSection() {
  const { user } = useUser();
  const { theme, updateTheme } = useAppContext();

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-4 w-screen fixed top-0 left-0">
      <div className="flex gap-6 items-center flex-1">
        <Link
          to={routeMap.home}
          className={buttonVariants({
            size: "icon",
            variant: "outline",
            className: "shrink-0",
          })}
        >
          <House />
        </Link>
        {/* Tab section */}
        {/* <div className="flex-1">
          <TabsList />
        </div> */}
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar>
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.displayName!} />
              ) : (
                <AvatarFallback>{user?.displayName}</AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuCheckboxItem
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                updateTheme(checked ? "dark" : "light")
              }
            >
              Dark mode
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
