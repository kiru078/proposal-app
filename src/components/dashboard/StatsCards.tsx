import { Card, CardContent } from "@/components/ui/card";
import { FileText, Send, Eye, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  proposals: Array<{ status: string }>;
}

export function StatsCards({ proposals }: StatsCardsProps) {
  const total = proposals.length;
  const sent = proposals.filter((p) => ["SENT", "VIEWED", "ACCEPTED"].includes(p.status)).length;
  const viewed = proposals.filter((p) => p.status === "VIEWED").length;
  const accepted = proposals.filter((p) => p.status === "ACCEPTED").length;

  const stats = [
    { label: "Total", value: total, icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "Enviadas", value: sent, icon: Send, color: "text-violet-600", bg: "bg-violet-100" },
    { label: "Visualizadas", value: viewed, icon: Eye, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Aceitas", value: accepted, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
