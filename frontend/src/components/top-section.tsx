"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { routeMap } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { House } from "lucide-react";

export function TopSection() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-4">
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
      <div className="flex gap-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.displayName!} />
              ) : (
                <AvatarFallback>{user?.displayName}</AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
