import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-slate-100 text-slate-700" },
  SENT: { label: "Enviada", className: "bg-violet-100 text-violet-700" },
  VIEWED: { label: "Visualizada", className: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Aceita", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Recusada", className: "bg-red-100 text-red-700" },
  PAID: { label: "Paga", className: "bg-emerald-100 text-emerald-700" },
};

export function ProposalStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
