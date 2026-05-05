import { ReactNode } from "react";
import { Input } from "@/components/ui/input";

export function FilterBar({ search, onSearch, children }: { search: string; onSearch: (v: string) => void; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <Input placeholder="Search…" value={search} onChange={(e) => onSearch(e.target.value)} className="max-w-xs h-9" />
      {children}
    </div>
  );
}
