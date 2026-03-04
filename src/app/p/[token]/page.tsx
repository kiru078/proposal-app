"use client";

import { useState, useEffect } from "react";
import { ProposalDocument } from "@/components/proposal-view/ProposalDocument";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Printer, Loader2, AlertCircle, CreditCard, BadgeCheck, AlertTriangle } from "lucide-react";

interface PageProps {
  params: { token: string };
}

export default function PublicProposalPage({ params }: PageProps) {
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      const res = await fetch(`/api/public/${params.token}`);
      if (!res.ok) {
        setError("Proposta não encontrada");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProposal(data);
      setLoading(false);
    };
    fetchProposal();
  }, [params.token]);

  const handleResponse = async (status: "ACCEPTED" | "REJECTED") => {
    setResponding(true);
    const res = await fetch(`/api/public/${params.token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setResponding(false);

    if (res.ok) {
      setProposal((prev: any) => ({ ...prev, status }));
      setResponded(true);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/checkout/${params.token}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setPayError(data.error || "Erro ao iniciar pagamento. Tente novamente.");
        setPaying(false);
      }
    } catch {
      setPayError("Erro de conexão. Verifique sua internet e tente novamente.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Proposta não encontrada</h2>
          <p className="text-slate-500 mt-2">Este link pode ter expirado ou ser inválido.</p>
        </div>
      </div>
    );
  }

  const canRespond = ["SENT", "VIEWED"].includes(proposal.status);
  const isPaid = proposal.status === "PAID";
  const isAccepted = proposal.status === "ACCEPTED";
  const paymentEnabled = proposal.enablePayment !== false;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* Client Actions */}
      {canRespond && !responded && (
        <div className="max-w-4xl mx-auto px-4 mb-6 no-print">
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium text-slate-800">Como você deseja responder a esta proposta?</p>
              <p className="text-sm text-slate-500">Sua resposta será registrada</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => handleResponse("REJECTED")}
                disabled={responding}
              >
                {responding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Recusar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleResponse("ACCEPTED")}
                disabled={responding}
              >
                {responding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Aceitar proposta
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Response confirmation + Pay now button */}
      {responded && (
        <div className="max-w-4xl mx-auto px-4 mb-6 no-print space-y-3">
          <div className={`rounded-lg border p-4 flex items-center gap-3 ${
            proposal.status === "ACCEPTED"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            {proposal.status === "ACCEPTED" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="font-medium text-green-800">Proposta aceita! Obrigado!</p>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="font-medium text-red-800">Proposta recusada.</p>
              </>
            )}
          </div>

          {/* Payment button after accepting */}
          {proposal.status === "ACCEPTED" && paymentEnabled && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-medium text-violet-900">Deseja pagar agora?</p>
                <p className="text-sm text-violet-700">Pagamento seguro via cartão de crédito</p>
              </div>
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                onClick={handlePayment}
                disabled={paying}
              >
                {paying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Pagar agora
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Already accepted — show pay or paid status */}
      {isAccepted && !responded && paymentEnabled && (
        <div className="max-w-4xl mx-auto px-4 mb-6 no-print space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="font-medium text-green-800">Esta proposta já foi aceita.</p>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium text-violet-900">Pagamento pendente</p>
              <p className="text-sm text-violet-700">Realize o pagamento para concluir o processo</p>
            </div>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={handlePayment}
              disabled={paying}
            >
              {paying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Pagar agora
            </Button>
          </div>
        </div>
      )}

      {/* Already paid */}
      {isPaid && (
        <div className="max-w-4xl mx-auto px-4 mb-6 no-print">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="font-medium text-emerald-800">Pagamento confirmado! Obrigado pelo seu pedido.</p>
          </div>
        </div>
      )}

      {/* Already rejected */}
      {proposal.status === "REJECTED" && !responded && (
        <div className="max-w-4xl mx-auto px-4 mb-6 no-print">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="font-medium text-red-800">Esta proposta foi recusada.</p>
          </div>
        </div>
      )}

      {/* Payment error */}
      {payError && (
        <div className="max-w-4xl mx-auto px-4 mb-4 no-print">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{payError}</p>
          </div>
        </div>
      )}

      {/* Print button */}
      <div className="max-w-4xl mx-auto px-4 flex justify-end mb-4 no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <div className="px-4">
        <ProposalDocument proposal={proposal} isPublic />
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 mt-8 text-center text-xs text-slate-400 no-print">
        <p>Proposta criada com ProposalApp</p>
      </div>
    </div>
  );
}
