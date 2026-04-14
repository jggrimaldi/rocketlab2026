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
          className="theme-input h-11 w-full min-w-0 rounded-full border px-4 text-sm sm:w-64"
          placeholder="Buscar produto"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <p className="theme-text-muted text-xs uppercase tracking-[0.2em] sm:text-right">
        {isSearching ? "Buscando..." : `${total} produtos`}
      </p>
    </div>
  )
}
