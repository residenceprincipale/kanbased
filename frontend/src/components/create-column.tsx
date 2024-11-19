"use client";
import { useState, type FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/openapi-react-query";
import { PlusIcon } from "lucide-react";
import { ColumnWrapper } from "@/components/ui/column";

export function CreateColumn(props: { boardName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = api.useMutation("post", "/columns");

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("column-name") as string;

    mutate(
      { body: { boardName: props.boardName, name, position: 0 } },
      {
        onSuccess() {
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <PlusIcon />
      </Button>
      {isOpen && (
        <ColumnWrapper>
          <form onSubmit={handleSubmit}>
            <Input
              id="column-name"
              name="column-name"
              placeholder="eg: work column"
              required
            />
          </form>
        </ColumnWrapper>
      )}
    </>
  );
}
