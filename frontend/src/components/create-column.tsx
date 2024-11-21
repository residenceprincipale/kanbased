"use client";
import { useRef, type FormEventHandler } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/openapi-react-query";
import { ColumnWrapper } from "@/components/ui/column";
import {
  setIsCreateColumnOpen,
  useGetIsCreateColumnOpen,
} from "@/routes/_blayout.boards.$boardName";
import { queryClient } from "@/lib/query-client";

export function CreateColumn(props: {
  boardName: string;
  lastPosition: number;
  onAdd: () => void;
}) {
  const isOpen = useGetIsCreateColumnOpen();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { mutate, isPending } = api.useMutation("post", "/columns");

  if (!isOpen) return null;

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("column-name") as string;

    mutate(
      {
        body: {
          boardName: props.boardName,
          name,
          position: props.lastPosition,
        },
      },
      {
        onSuccess() {
          queryClient.invalidateQueries(
            api.queryOptions("get", "/columns", {
              params: { query: { boardName: props.boardName } },
            })
          );
          props.onAdd();
        },
      }
    );

    (e.target as HTMLFormElement).reset();
  };

  return (
    <>
      {isOpen && (
        <ColumnWrapper className="!h-[110px]">
          <form onSubmit={handleSubmit} className="px-2 pt-0.5">
            <Input
              id="column-name"
              name="column-name"
              placeholder="eg: work column"
              required
              autoFocus
              onKeyDown={(event) => {
                // if (event.key === "Enter") {
                //   event.preventDefault();
                //   buttonRef.current!.click();
                // }
                if (event.key === "Escape") {
                  setIsCreateColumnOpen(false);
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsCreateColumnOpen(false);
                }
              }}
            />
          </form>
        </ColumnWrapper>
      )}
    </>
  );
}
