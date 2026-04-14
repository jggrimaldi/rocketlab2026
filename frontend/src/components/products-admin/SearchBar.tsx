import { Search } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="theme-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
      <input
        className="theme-input h-11 w-full rounded-full border pl-11 pr-4 text-sm"
        placeholder="Buscar produto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
