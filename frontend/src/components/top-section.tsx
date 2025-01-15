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
import { routeMap } from "@/lib/constants";
import { fetchAndCacheImage } from "@/lib/utils";
import { Route } from "@/routes/__root";
import { useAppContext } from "@/state/app-state";
import { Link } from "@tanstack/react-router";
import { House, User } from "lucide-react";
import { useEffect, useState } from "react";

export function TopSection() {
  const {
    auth: { user },
  } = Route.useRouteContext();
  const { theme, updateTheme } = useAppContext();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.image) return;
    fetchAndCacheImage(`${user.image}`, user.image).then((url) => {
      if (!url) return;
      setAvatarUrl(url);
    });
  }, [user?.image]);

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-4 w-screen fixed top-0 left-0 z-10 bg-background">
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
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user!.displayName!} />
              ) : (
                <AvatarFallback className="border">
                  <User />
                </AvatarFallback>
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
