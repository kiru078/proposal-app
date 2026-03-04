import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function renderItemRow(item: TemplateProps["proposal"]["items"][0]) {
  if (item.itemType === "percentage") {
    return (
      <tr key={item.id}>
        <td className="py-4 pr-4 text-gray-700">{item.description}</td>
        <td className="py-4 text-right text-gray-500" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="py-4 text-right text-gray-400 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr key={item.id}>
      <td className="py-4 pr-4 text-gray-700">{item.description}</td>
      <td className="py-4 text-right text-gray-500">{item.quantity}</td>
      <td className="py-4 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
      <td className="py-4 text-right text-gray-900 font-medium">
        {formatCurrency(item.quantity * item.unitPrice)}
      </td>
    </tr>
  );
}

export function MinimalTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-sm border border-gray-100">
      {/* Top accent line */}
      <div className="h-1 bg-emerald-500" />

      {expired && isPublic && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-10 py-3">
          <span className="text-yellow-600 font-medium text-sm">
            ⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}
          </span>
        </div>
      )}

      <div className="px-10 py-10 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Proposta</p>
            <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">{proposal.title}</h1>
            <p className="text-gray-400 text-sm mt-1"># {proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-400 text-sm">{proposal.user.name}</p>}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-10 py-6 border-y border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Data</p>
            <p className="text-sm text-gray-700">{formatDate(proposal.createdAt)}</p>
          </div>
          {proposal.validUntil && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Válida até</p>
              <p className={`text-sm ${expired ? "text-red-500" : "text-gray-700"}`}>
                {formatDate(proposal.validUntil)}
              </p>
            </div>
          )}
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">De</p>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
              {proposal.user.companyName && <p className="text-gray-500 text-sm">{proposal.user.name}</p>}
              <p className="text-gray-400 text-sm">{proposal.user.email}</p>
              {proposal.user.phone && <p className="text-gray-400 text-sm">{proposal.user.phone}</p>}
              {proposal.user.address && <p className="text-gray-400 text-sm">{proposal.user.address}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Para</p>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{proposal.clientName}</p>
              {proposal.clientCompany && <p className="text-gray-500 text-sm">{proposal.clientCompany}</p>}
              <p className="text-gray-400 text-sm">{proposal.clientEmail}</p>
              {proposal.clientPhone && <p className="text-gray-400 text-sm">{proposal.clientPhone}</p>}
            </div>
          </div>
        </div>

        {proposal.coverLetter && (
          <div>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Serviços / Produtos</p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-3 text-xs text-gray-400 uppercase tracking-wider font-normal">Descrição</th>
                <th className="text-right pb-3 text-xs text-gray-400 uppercase tracking-wider font-normal">Qtd</th>
                <th className="text-right pb-3 text-xs text-gray-400 uppercase tracking-wider font-normal">Unitário</th>
                <th className="text-right pb-3 text-xs text-gray-400 uppercase tracking-wider font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposal.items.map(renderItemRow)}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-xs">
          <div className="flex justify-between text-sm py-2">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-gray-700">{formatCurrency(subtotal)}</span>
          </div>
          {proposal.taxRate > 0 && (
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-400">Imposto ({proposal.taxRate}%)</span>
              <span className="text-gray-700">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t border-gray-200 mt-1">
            <span className="text-gray-900 font-medium">Total</span>
            <span className="text-3xl font-extralight text-emerald-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {proposal.terms && (
          <div className="pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Termos</p>
            <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="border-t border-gray-50 pt-6 text-center text-xs text-gray-300">
          <p>Proposta gerada pelo ProposalApp</p>
        </div>
      </div>
    </div>
  );
}
