type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const maxVisible = 4
  const clampedCurrent = Math.min(Math.max(currentPage, 1), totalPages)
  let start = Math.max(1, clampedCurrent - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1

  if (end > totalPages) {
    end = totalPages
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(Math.max(1, clampedCurrent - 1))}
        disabled={clampedCurrent === 1}
        type="button"
      >
        Anterior
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`h-10 w-10 rounded-full border text-sm font-semibold transition ${
            page === currentPage
              ? "border-[#e8c547]/60 bg-[#e8c547]/15 text-[#e8c547]"
              : "border-[#1f1f24] bg-[#141417] text-slate-200 hover:border-[#e8c547]/40"
          }`}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <button
        className="rounded-full border border-[#1f1f24] bg-[#141417] px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(Math.min(totalPages, clampedCurrent + 1))}
        disabled={clampedCurrent === totalPages}
        type="button"
      >
        Proxima
      </button>
    </div>
  )
}
