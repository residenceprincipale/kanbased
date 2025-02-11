'use client'
import { Columns } from '@/features/board-detail/components/columns'

import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { columnsQueryOptions } from '@/lib/query-options-factory'
import { ModalProvider } from '@/state/modals'
import { CreateColumnButton } from '@/features/board-detail/components/create-column-button'

export const Route = createFileRoute(
  '/_authenticated/_layout/boards_/$boardName',
)({
  component: BoardPage,
  loader: async (ctx) => {
    const { boardName } = ctx.params
    await queryClient.prefetchQuery(columnsQueryOptions(boardName))
  },
})

function BoardPage() {
  const { boardName } = Route.useParams()

  return (
    <ModalProvider>
      <div className="pt-4 flex-1 h-full min-h-0 flex flex-col gap-8">
        <div className="flex gap-5 items-center shrink-0 px-8">
          <h1 className="text-2xl font-bold">{boardName}</h1>
          <CreateColumnButton />
        </div>

        <div className="flex-1 h-full min-h-0">
          <Columns boardName={boardName} />
        </div>
      </div>
    </ModalProvider>
  )
}
