import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function ItemRow({ item }: { item: TemplateProps["proposal"]["items"][0] }) {
  if (item.itemType === "percentage") {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-3 pr-2 text-gray-800 text-sm">{item.description}</td>
        <td className="py-3 text-center text-amber-600 font-semibold text-sm" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="py-3 text-right text-gray-400 italic text-xs">A calcular</td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-2 text-gray-800 text-sm">{item.description}</td>
      <td className="py-3 text-center text-gray-500 text-sm">{item.quantity}</td>
      <td className="py-3 text-right text-gray-500 text-sm">{formatCurrency(item.unitPrice)}</td>
      <td className="py-3 text-right font-semibold text-gray-900 text-sm">{formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  );
}

export function ClassicTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-xl overflow-hidden">
      {expired && isPublic && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3">
          <span className="text-amber-700 font-medium text-sm">⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-950 px-5 md:px-10 pt-8 md:pt-12 pb-0">
        <div className="h-0.5 bg-amber-400 mb-6 w-12" />
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-8 md:pb-10">
          <div className="flex-1">
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-3">Proposta Comercial</p>
            <h1 className="text-3xl md:text-5xl font-light text-white leading-tight tracking-tight">{proposal.title}</h1>
            <p className="text-gray-600 text-sm mt-3 tracking-widest">Nº {proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="md:text-right md:pl-6">
            <p className="text-white font-semibold">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-400 text-sm mt-1">{proposal.user.name}</p>}
            <p className="text-gray-500 text-xs mt-1 break-words">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-gray-500 text-xs">{proposal.user.phone}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 md:gap-10 border-t border-gray-800 py-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xs tracking-widest uppercase">Status</span>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <div>
            <span className="text-gray-600 text-xs tracking-widest uppercase">Emitida </span>
            <span className="text-gray-300 text-sm">{formatDate(proposal.createdAt)}</span>
          </div>
          {proposal.validUntil && (
            <div>
              <span className="text-gray-600 text-xs tracking-widest uppercase">Válida até </span>
              <span className={`text-sm ${expired ? "text-red-400" : "text-gray-300"}`}>{formatDate(proposal.validUntil)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10">
        {/* Partes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-amber-500 uppercase tracking-[0.2em] font-bold mb-3">Apresentado por</p>
            <p className="font-bold text-gray-900 text-base md:text-lg">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-500 text-sm">{proposal.user.name}</p>}
            <p className="text-gray-400 text-sm break-words">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-gray-400 text-sm">{proposal.user.phone}</p>}
            {proposal.user.address && <p className="text-gray-400 text-sm">{proposal.user.address}</p>}
          </div>
          <div>
            <p className="text-xs text-amber-500 uppercase tracking-[0.2em] font-bold mb-3">Apresentado para</p>
            <p className="font-bold text-gray-900 text-base md:text-lg">{proposal.clientName}</p>
            {proposal.clientCompany && <p className="text-gray-500 text-sm">{proposal.clientCompany}</p>}
            <p className="text-gray-400 text-sm break-words">{proposal.clientEmail}</p>
            {proposal.clientPhone && <p className="text-gray-400 text-sm">{proposal.clientPhone}</p>}
          </div>
        </div>

        {proposal.coverLetter && (
          <div className="bg-gray-50 border border-gray-100 rounded p-4 md:p-6">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Itens */}
        <div>
          <div className="flex items-center gap-4 mb-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Escopo e Valores</h3>
            <div className="h-px flex-1 bg-amber-200" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="text-center pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Qtd</th>
                  <th className="text-right pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Unitário</th>
                  <th className="text-right pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>{proposal.items.map((item) => <ItemRow key={item.id} item={item} />)}</tbody>
            </table>
          </div>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">{formatCurrency(subtotal)}</span>
            </div>
            {proposal.taxRate > 0 && (
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-gray-500">Imposto ({proposal.taxRate}%)</span>
                <span className="text-gray-700">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t-2 border-gray-900 mt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Geral</span>
              <span className="font-black text-2xl md:text-3xl text-gray-900">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">Termos e Condições</p>
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
