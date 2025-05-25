import {useCallback, useEffect, useRef} from "react";
import {DragDropContext, Droppable} from "@hello-pangea/dnd";
import type {OnDragEndResponder} from "@hello-pangea/dnd";
import type {GetBoardWithColumnsAndTasksQueryResult} from "@/lib/zero-queries";
import {Column} from "@/features/board-detail/column";
import {CreateColumn} from "@/features/board-detail/create-column";
import {
  useColumnModalControls,
  useColumnModalState,
} from "@/features/board-detail/column.state";
import {useZ} from "@/lib/zero-cache";

export function Columns({
  boardId,
  columns,
}: {
  boardId: string;
  columns: NonNullable<GetBoardWithColumnsAndTasksQueryResult>["columns"];
}) {
  const z = useZ();
  const containerRef = useRef<HTMLDivElement>(null);
  const {closeModal} = useColumnModalControls();

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     const activeElement = document.activeElement;
  //     if (!activeElement?.hasAttribute("data-kb-focus")) {
  //       return;
  //     }

  //     if (event.key === "ArrowRight" || event.key === "l") {
  //       event.preventDefault();
  //       const columnIndex = Number(
  //         activeElement.getAttribute("data-column-index"),
  //       );
  //       const nextColumn = columns[columnIndex + 1];
  //       const hasTasks = !!nextColumn?.tasks?.length;
  //       const nextColumnEl = document.getElementById(`col-${nextColumn?.id}`);
  //       const firstTaskEl = nextColumnEl?.querySelector(
  //         "[data-kb-focus]",
  //       ) as HTMLElement | null;
  //       const focusEl = hasTasks ? firstTaskEl : nextColumnEl;
  //       focusEl?.focus();
  //       focusEl?.scrollIntoView();
  //     }

  //     if (event.key === "ArrowLeft" || event.key === "h") {
  //       event.preventDefault();

  //       const columnIndex = Number(
  //         activeElement.getAttribute("data-column-index"),
  //       );
  //       const previousColumn = columns[columnIndex - 1];
  //       const hasTasks = !!previousColumn?.tasks?.length;
  //       const previousColumnEl = document.getElementById(
  //         `col-${previousColumn?.id}`,
  //       );
  //       const firstTaskEl = previousColumnEl?.querySelector(
  //         "[data-kb-focus]",
  //       ) as HTMLElement | null;

  //       columnIndex === 1 && containerRef?.current?.scrollTo({left: 0});

  //       const focusEl = hasTasks ? firstTaskEl : previousColumnEl;
  //       focusEl?.focus();
  //       focusEl?.scrollIntoView();
  //     }
  //   };

  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [columns]);

  const lastColumnRef = useCallback((node: HTMLDivElement | null) => {
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
      left: containerRef.current.scrollWidth,
    });
  }, []);

  const handleDragEnd: OnDragEndResponder = (e) => {
    if (!e.destination) {
      return;
    }

    const {source, destination} = e;

    // Did not move anywhere.
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (e.type === "COLUMN") {
      const colCopy = [...columns];

      const [removedEl] = colCopy.splice(e.source.index, 1);
      colCopy.splice(e.destination.index, 0, removedEl!);

      const updatedColPositions = colCopy.map((col, index) => ({
        id: col.id,
        position: index + 1,
      }));

      z.mutateBatch(async (mutate) => {
        for (const col of updatedColPositions) {
          await mutate.columnsTable.update({
            id: col.id,
            position: col.position,
          });
        }
      });

      return;
    }

    if (e.type === "TASK") {
      const updatedTask = reorderTask({
        sourceColumnId: e.source.droppableId,
        sourceTaskId: e.draggableId,
        destinationColumnId: e.destination.droppableId,
        destinationTaskIndex: e.destination.index,
        columns,
      });

      z.mutate.tasksTable.update(updatedTask);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
              className="pb-8 h-full inline-flex px-8 space-x-4"
              {...provided.droppableProps}
            >
              <div className="flex h-full" ref={provided.innerRef}>
                {columns.map((column, i, arr) => (
                  <Column
                    column={column}
                    columnRef={arr.length - 1 === i ? lastColumnRef : undefined}
                    index={i}
                    key={column.id}
                  />
                ))}
                {provided.placeholder}
              </div>

              <CreateColumnModalGate>
                <CreateColumn
                  data={{
                    boardId,
                    nextPosition:
                      (columns[columns.length - 1]?.position ?? 0) + 1,
                  }}
                  onClose={closeModal}
                />
              </CreateColumnModalGate>
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}

function CreateColumnModalGate(props: React.PropsWithChildren) {
  const {activeModal} = useColumnModalState();

  if (activeModal?.type !== "create-column") {
    return null;
  }

  return props.children;
}

function reorderTask(params: {
  sourceColumnId: string;
  sourceTaskId: string;
  destinationColumnId: string;
  destinationTaskIndex: number;
  columns: NonNullable<GetBoardWithColumnsAndTasksQueryResult>["columns"];
}) {
  const isSameColumn = params.sourceColumnId === params.destinationColumnId;
  const destinationColumnId = params.destinationColumnId;

  const destinationColumn = params.columns.find(
    (col) => col.id === destinationColumnId,
  )!;

  let destinationTasks = [...destinationColumn.tasks]
    .sort((a, b) => a.position - b.position)
    .map((task) => ({
      id: task.id,
      position: task.position,
      columnId: task.columnId,
    }));

  // If moving within the same column, remove the dragged task from the list first
  if (isSameColumn) {
    destinationTasks = destinationTasks.filter(
      (task) => task.id !== params.sourceTaskId,
    );
  }

  // Now simulate dropping it at the destination index
  destinationTasks.splice(params.destinationTaskIndex, 0, {
    id: params.sourceTaskId,
    position: 0, // temporary
    columnId: destinationColumnId,
  });

  // Get before & after tasks around the new index
  const beforeTask = destinationTasks[params.destinationTaskIndex - 1] ?? null;
  const afterTask = destinationTasks[params.destinationTaskIndex + 1] ?? null;

  let newPosition: number;

  if (beforeTask && afterTask) {
    newPosition = (beforeTask.position + afterTask.position) / 2;
  } else if (!beforeTask && afterTask) {
    newPosition = afterTask.position - 1;
  } else if (beforeTask && !afterTask) {
    newPosition = beforeTask.position + 1;
  } else {
    newPosition = 1000;
  }

  return {
    id: params.sourceTaskId,
    position: newPosition,
    columnId: destinationColumn.id,
  };
}

function getNextElementWithDataKbFocus(activeElement: Element | null) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: HTMLElement) =>
        node.hasAttribute("data-kb-focus")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    },
  );

  if (activeElement) {
    walker.currentNode = activeElement;
  }

  return walker.nextNode(); // Just go to the next matching one after active
}

function getPreviousElementWithDataKbFocus(activeElement: Element | null) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: HTMLElement) =>
        node.hasAttribute("data-kb-focus")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    },
  );

  if (activeElement) {
    walker.currentNode = activeElement;
  }

  return walker.previousNode(); // Just go to the next matching one after active
}
