import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => router.history.back()}
          className="h-8"
          aria-label="Go back"
          disabled={!canGoBack}
        >
          <ArrowLeft />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Go back</TooltipContent>
    </Tooltip>
  );
}
