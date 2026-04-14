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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="h-11 w-full rounded-full border border-[#1f1f24] bg-[#0d0d0f] px-4 text-sm text-slate-100 placeholder:text-slate-500 sm:w-64"
          placeholder="Buscar produto"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {isSearching ? "Buscando..." : `${total} produtos`}
      </p>
    </div>
  )
}
