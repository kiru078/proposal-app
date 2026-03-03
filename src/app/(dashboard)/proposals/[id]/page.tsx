"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProposalDocument } from "@/components/proposal-view/ProposalDocument";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { buildPublicUrl } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Send,
  Copy,
  Link2,
  Printer,
  Loader2,
} from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default function ProposalPreviewPage({ params }: PageProps) {
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      const res = await fetch(`/api/proposals/${params.id}`);
      if (!res.ok) {
        toast({ title: "Proposta não encontrada", variant: "destructive" });
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setProposal(data);
      setLoading(false);
    };
    fetchProposal();
  }, [params.id, router]);

  const handleSend = async () => {
    setSending(true);
    const res = await fetch(`/api/proposals/${params.id}/send`, { method: "POST" });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      toast({ title: "Erro ao enviar", variant: "destructive" });
      return;
    }

    await navigator.clipboard.writeText(data.publicUrl);
    toast({
      title: "Link copiado!",
      description: "Proposta marcada como enviada. URL copiada para área de transferência.",
    });
    setProposal((prev: any) => ({ ...prev, status: "SENT" }));
  };

  const copyPublicLink = async () => {
    if (!proposal) return;
    const url = buildPublicUrl(proposal.publicToken);
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyPublicLink}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Copiar link
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/proposals/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Enviar & Copiar link
          </Button>
        </div>
      </div>

      <ProposalDocument proposal={proposal} />
    </div>
  );
}
