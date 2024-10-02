"use client";
import { useRepContext } from "@/components/replicache-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, type FormEventHandler } from "react";

export function CreateColumn(props: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const rep = useRepContext();
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const columnName = fd.get("column-name") as string;
    rep.mutate.createColumn({ name: columnName });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="!gap-0 sm:max-w-[425px]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Column</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 mt-4 mb-2">
            <Label htmlFor="column-name">Column Name</Label>
            <Input
              id="column-name"
              name="column-name"
              placeholder="eg: work column"
              required
            />
            <DialogDescription className="!text-xs">
              Enter a unique name that reflects the purpose of this column.
            </DialogDescription>
          </div>

          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
