type ProductsToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  total: number
  isSearching: boolean
}

export function ProductsToolbar({
  search,
  onSearchChange,
  total,
  isSearching,
}: ProductsToolbarProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <input
          className="h-11 w-full min-w-0 rounded-full border border-[#1f1f24] bg-[#0d0d0f] px-4 text-sm text-slate-100 placeholder:text-slate-500 sm:w-64"
          placeholder="Buscar produto"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-right">
        {isSearching ? "Buscando..." : `${total} produtos`}
      </p>
    </div>
  )
}
