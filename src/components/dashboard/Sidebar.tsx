"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FilePlus,
  User,
  FileText,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/proposals/new",
    label: "Nova Proposta",
    icon: FilePlus,
  },
  {
    href: "/profile",
    label: "Meu Perfil",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col no-print">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-violet-600" />
          <span className="font-bold text-lg text-slate-800">ProposalApp</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center">ProposalApp v1.0</p>
      </div>
    </aside>
  );
}
