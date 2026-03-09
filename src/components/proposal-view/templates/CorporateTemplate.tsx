import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function ItemRow({ item }: { item: TemplateProps["proposal"]["items"][0] }) {
  if (item.itemType === "percentage") {
    return (
      <tr className="border-b border-blue-50">
        <td className="px-5 py-4 text-gray-800">{item.description}</td>
        <td className="px-5 py-4 text-center text-orange-500 font-semibold" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="px-5 py-4 text-right text-gray-400 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-blue-50 hover:bg-blue-50/30 transition-colors">
      <td className="px-5 py-4 text-gray-800">{item.description}</td>
      <td className="px-5 py-4 text-center text-gray-500">{item.quantity}</td>
      <td className="px-5 py-4 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
      <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  );
}

export function CorporateTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-xl overflow-hidden rounded-lg">
      {expired && isPublic && (
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-3">
          <span className="text-amber-700 text-sm">⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}</span>
        </div>
      )}

      {/* Header: azul escuro com acento laranja */}
      <div style={{ backgroundColor: "#0f2744" }} className="px-10 py-12">
        {/* Faixa laranja vertical */}
        <div className="flex gap-8 items-start">
          <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: "#f97316", minHeight: "80px" }} />
          <div className="flex-1">
            <p className="text-orange-400 text-xs uppercase tracking-[0.3em] font-bold mb-2">Proposta Comercial</p>
            <h1 className="text-4xl font-black text-white leading-tight">{proposal.title}</h1>
            <p className="text-slate-500 text-sm mt-2 tracking-widest">REF: {proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-slate-400 text-sm">{proposal.user.name}</p>}
            <p className="text-slate-500 text-xs mt-1">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-slate-500 text-xs">{proposal.user.phone}</p>}
          </div>
        </div>

        {/* Info bar */}
        <div className="flex flex-wrap gap-8 mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Status</span>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider">Data </span>
            <span className="text-slate-300 text-sm">{formatDate(proposal.createdAt)}</span>
          </div>
          {proposal.validUntil && (
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider">Válida até </span>
              <span className={`text-sm ${expired ? "text-red-400" : "text-slate-300"}`}>{formatDate(proposal.validUntil)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Barra laranja fina */}
      <div className="h-1" style={{ backgroundColor: "#f97316" }} />

      <div className="px-10 py-10 space-y-10">
        {/* Partes */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg p-5" style={{ backgroundColor: "#f0f4f8" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>Apresentado por</p>
            <p className="font-bold text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-500 text-sm">{proposal.user.name}</p>}
            <p className="text-gray-400 text-sm">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-gray-400 text-sm">{proposal.user.phone}</p>}
            {proposal.user.address && <p className="text-gray-400 text-sm">{proposal.user.address}</p>}
          </div>
          <div className="rounded-lg p-5" style={{ backgroundColor: "#fff7ed" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>Apresentado para</p>
            <p className="font-bold text-gray-900">{proposal.clientName}</p>
            {proposal.clientCompany && <p className="text-gray-500 text-sm">{proposal.clientCompany}</p>}
            <p className="text-gray-400 text-sm">{proposal.clientEmail}</p>
            {proposal.clientPhone && <p className="text-gray-400 text-sm">{proposal.clientPhone}</p>}
          </div>
        </div>

        {proposal.coverLetter && (
          <div className="border-l-4 pl-6" style={{ borderColor: "#f97316" }}>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Itens */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0f2744" }}>Escopo de Serviços</h3>
            <div className="h-px flex-1" style={{ backgroundColor: "#f97316" }} />
          </div>
          <div className="overflow-hidden rounded-lg border border-orange-100">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#0f2744" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-orange-300">Descrição</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-orange-300">Qtd</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-orange-300">Unitário</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-orange-300">Total</th>
                </tr>
              </thead>
              <tbody>{proposal.items.map((item) => <ItemRow key={item.id} item={item} />)}</tbody>
            </table>
          </div>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-72 rounded-lg overflow-hidden">
            <div style={{ backgroundColor: "#0f2744" }} className="px-5 py-3">
              <p className="text-orange-300 text-xs uppercase tracking-widest font-bold">Resumo Financeiro</p>
            </div>
            <div className="bg-slate-50 px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">{formatCurrency(subtotal)}</span>
              </div>
              {proposal.taxRate > 0 && (
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Imposto ({proposal.taxRate}%)</span>
                  <span className="text-gray-700">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-2xl" style={{ color: "#f97316" }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#0f2744" }}>Termos e Condições</p>
            <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-300 border-t border-gray-100 pt-6">
          Proposta gerada pelo ProposalApp
        </div>
      </div>
    </div>
  );
}
