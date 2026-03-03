"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProposalTable } from "@/components/dashboard/ProposalTable";
import { FilePlus } from "lucide-react";

type StatusFilter = "ALL" | "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "DRAFT", label: "Rascunhos" },
  { value: "SENT", label: "Enviadas" },
  { value: "VIEWED", label: "Visualizadas" },
  { value: "ACCEPTED", label: "Aceitas" },
  { value: "REJECTED", label: "Recusadas" },
];

export default function DashboardPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/proposals?status=${filter}`);
    if (res.ok) {
      const data = await res.json();
      setProposals(data);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Minhas Propostas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie e acompanhe todas as suas propostas
          </p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">
            <FilePlus className="mr-2 h-4 w-4" />
            Nova Proposta
          </Link>
        </Button>
      </div>

      <StatsCards proposals={proposals} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <ProposalTable proposals={proposals} onRefresh={fetchProposals} />
      )}
    </div>
  );
}
