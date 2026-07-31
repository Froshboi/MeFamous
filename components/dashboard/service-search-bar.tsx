"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { inputClass } from "@/components/auth/auth-card";

export function ServiceSearchBar({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        aria-label="Search services"
        placeholder="Search services…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateParam("q", e.target.value)}
        className={`${inputClass} sm:max-w-xs`}
      />
      <select
        aria-label="Filter by category"
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className={`${inputClass} sm:max-w-[200px]`}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
