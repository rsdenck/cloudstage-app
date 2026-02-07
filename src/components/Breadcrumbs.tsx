"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-[13px]", className)}>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-600" />}
          <Link
            href={item.href}
            className={cn(
              "transition-colors",
              index === items.length - 1
                ? "text-slate-200 font-medium"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
