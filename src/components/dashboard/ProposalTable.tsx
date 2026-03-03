"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatCurrency, computeTotals } from "@/lib/utils";
import {
  Eye,
  Edit,
  Copy,
  Send,
  Trash2,
  MoreHorizontal,
  Link2,
  FilePlus,
} from "lucide-react";

interface ProposalItem {
  quantity: number;
  unitPrice: number;
}

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientCompany?: string | null;
  status: string;
  taxRate: number;
  createdAt: string;
  validUntil?: string | null;
  publicToken: string;
  items: ProposalItem[];
}

interface ProposalTableProps {
  proposals: Proposal[];
  onRefresh: () => void;
}

export function ProposalTable({ proposals, onRefresh }: ProposalTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    setLoadingId(id);
    const res = await fetch(`/api/proposals/${id}/send`, { method: "POST" });
    const data = await res.json();
    setLoadingId(null);

    if (!res.ok) {
      toast({ title: "Erro ao enviar", variant: "destructive" });
      return;
    }

    await navigator.clipboard.writeText(data.publicUrl);
    toast({
      title: "Link copiado!",
      description: "Proposta marcada como enviada. URL copiada para a área de transferência.",
    });
    onRefresh();
  };

  const handleDuplicate = async (id: string) => {
    setLoadingId(id);
    const res = await fetch(`/api/proposals/${id}/duplicate`, { method: "POST" });
    setLoadingId(null);

    if (!res.ok) {
      toast({ title: "Erro ao duplicar", variant: "destructive" });
      return;
    }

    toast({ title: "Proposta duplicada!" });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    setLoadingId(null);

    if (!res.ok) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
      return;
    }

    toast({ title: "Proposta excluída" });
    onRefresh();
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/p/${token}`;
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-16">
        <FilePlus className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          Nenhuma proposta ainda
        </h3>
        <p className="text-slate-500 mb-4">
          Crie sua primeira proposta profissional agora
        </p>
        <Button asChild>
          <Link href="/proposals/new">Criar proposta</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Título / Cliente
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
              Valor Total
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
              Data
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proposals.map((proposal) => {
            const { grandTotal } = computeTotals(proposal.items, proposal.taxRate);
            return (
              <tr key={proposal.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="font-medium text-slate-800 hover:text-blue-600"
                  >
                    {proposal.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {proposal.clientName}
                    {proposal.clientCompany && ` · ${proposal.clientCompany}`}
                  </p>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="font-medium text-slate-700">
                    {formatCurrency(grandTotal)}
                  </span>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-sm text-slate-500">
                    {formatDate(proposal.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ProposalStatusBadge status={proposal.status} />
                </td>
                <td className="px-4 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/proposals/${proposal.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/proposals/${proposal.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => copyLink(proposal.publicToken)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Copiar link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSend(proposal.id)}
                        disabled={loadingId === proposal.id}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar & Copiar link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(proposal.id)}
                        disabled={loadingId === proposal.id}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A proposta será
                              excluída permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(proposal.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
