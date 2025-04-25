import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

function UserAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string;
  className?: string;
}) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getColorFromName(name), [name]);

  return (
    <Avatar className={className}>
      <AvatarImage
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
      />
      <AvatarFallback
        className="text-white text-xs"
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2); // Keep max 2 characters
}

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360); // hue between 0 and 359
  return `hsl(${hue}, 65%, 55%)`; // tweak saturation/lightness to your taste
}

export default UserAvatar;
