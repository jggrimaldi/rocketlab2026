type PageHeaderProps = {
  title: string
  onAdd: () => void
}

export function PageHeader({ title, onAdd }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">{title}</h1>
      <button
        className="rounded-full bg-[#e8c547] px-4 py-2 text-sm font-semibold text-[#0d0d0f] shadow-lg shadow-[#e8c547]/30 transition hover:-translate-y-0.5"
        onClick={onAdd}
        type="button"
      >
        + Adicionar Produto
      </button>
    </div>
  )
}
