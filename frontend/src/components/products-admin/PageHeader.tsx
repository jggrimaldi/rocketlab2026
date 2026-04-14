type PageHeaderProps = {
  title?: string
  onAdd: () => void
}

export function PageHeader({ title, onAdd }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {title ? <h1 className="theme-text-primary text-2xl font-semibold sm:text-3xl">{title}</h1> : <div />}
      <button
        className="theme-button-primary rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
        onClick={onAdd}
        type="button"
      >
        + Adicionar Produto
      </button>
    </div>
  )
}
