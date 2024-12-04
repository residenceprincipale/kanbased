import { Column } from "@/features/columns/column";
import { useCallback, useRef } from "react";
import { CreateColumn } from "@/features/columns/create-column";
import { useColumnsSuspenseQuery } from "@/features/columns/queries";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

export function Columns(props: { boardName: string }) {
  const { data } = useColumnsSuspenseQuery(props.boardName);
  const columns = data.columns;

  const containerRef = useRef<HTMLDivElement>(null);

  const lastColumnRef = useCallback((node: HTMLElement | null) => {
    /*
     * This callback is used to scroll to the end of the container whenever a new column is added.
     *
     * React assigns and calls ref callbacks for child components before assigning refs for their parent components.
     * By leveraging this behavior, we can ensure this code runs after the child node is mounted.
     *
     * The cool thing about this is The container won't scroll on the initial mount of the app.
     * The reason is `containerRef` will be null on initial mount because child nodes refs will be called first
     */

    if (!node) return;
    containerRef.current?.scrollTo({
      left: containerRef.current!.scrollWidth,
    });
  }, []);

  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable
        droppableId="board"
        type="COLUMN"
        direction="horizontal"
        ignoreContainerClipping={false}
        isCombineEnabled={false}
      >
        {(provided) => {
          return (
            <div
              ref={containerRef}
              className="pb-8 h-full inline-flex gap-4 px-8"
              {...provided.droppableProps}
            >
              <div className="flex gap-4 h-full" ref={provided.innerRef}>
                {[...columns]
                  .sort((a, b) => a.position - b.position)
                  .map((column, i, arr) => (
                    <Column
                      boardName={props.boardName}
                      column={column}
                      columnRef={
                        arr.length - 1 === i ? lastColumnRef : undefined
                      }
                      index={i}
                      key={column.id}
                    />
                  ))}
                {provided.placeholder}
              </div>

              <CreateColumn
                boardName={props.boardName}
                nextPosition={columns?.length ?? 0}
              />
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}
