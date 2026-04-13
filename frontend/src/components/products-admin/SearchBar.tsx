import { Search } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        className="h-11 w-full rounded-full border border-[#1f1f24] bg-[#0d0d0f] pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500"
        placeholder="Buscar produto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
