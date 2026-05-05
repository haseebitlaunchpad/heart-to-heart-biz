import { ReactNode } from "react";
import { Input } from "@/components/ui/input";

export function FilterBar({
  search, onSearch, children, placeholder = "Search…",
}: {
  search?: string;
  onSearch?: (v: string) => void;
  children?: ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {onSearch && (
        <Input
          placeholder={placeholder}
          value={search ?? ""}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-xs h-9"
        />
      )}
      {children}
    </div>
  );
}
