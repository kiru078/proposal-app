import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function renderItemRow(item: TemplateProps["proposal"]["items"][0]) {
  if (item.itemType === "percentage") {
    return (
      <tr key={item.id}>
        <td className="px-4 py-3 text-slate-800">{item.description}</td>
        <td className="px-4 py-3 text-right text-slate-600" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="px-4 py-3 text-right font-medium text-slate-500 italic text-sm">
          A calcular
        </td>
      </tr>
    );
  }
  return (
    <tr key={item.id}>
      <td className="px-4 py-3 text-slate-800">{item.description}</td>
      <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
      <td className="px-4 py-3 text-right font-medium text-slate-800">
        {formatCurrency(item.quantity * item.unitPrice)}
      </td>
    </tr>
  );
}

export function ModernTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden">
      {expired && isPublic && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-8 py-3 flex items-center gap-2">
          <span className="text-yellow-600 font-medium text-sm">
            ⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-violet-800 px-8 py-10 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">PROPOSTA</h1>
            <p className="text-violet-200 text-sm">#{proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && (
              <p className="text-violet-200 text-sm">{proposal.user.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Meta */}
        <div className="flex flex-wrap gap-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Status</p>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Data</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(proposal.createdAt)}</p>
          </div>
          {proposal.validUntil && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Válida até</p>
              <p className={`text-sm font-medium ${expired ? "text-red-500" : "text-slate-700"}`}>
                {formatDate(proposal.validUntil)}
              </p>
            </div>
          )}
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">De</p>
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">{proposal.user.companyName || proposal.user.name}</p>
              {proposal.user.companyName && <p className="text-slate-600 text-sm">{proposal.user.name}</p>}
              <p className="text-slate-500 text-sm">{proposal.user.email}</p>
              {proposal.user.phone && <p className="text-slate-500 text-sm">{proposal.user.phone}</p>}
              {proposal.user.address && <p className="text-slate-500 text-sm">{proposal.user.address}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Para</p>
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">{proposal.clientName}</p>
              {proposal.clientCompany && <p className="text-slate-600 text-sm">{proposal.clientCompany}</p>}
              <p className="text-slate-500 text-sm">{proposal.clientEmail}</p>
              {proposal.clientPhone && <p className="text-slate-500 text-sm">{proposal.clientPhone}</p>}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">{proposal.title}</h2>

        {proposal.coverLetter && (
          <div className="bg-slate-50 rounded-lg p-6">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Itens</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtd</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço unit.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposal.items.map(renderItemRow)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-2">
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-700">{formatCurrency(subtotal)}</span>
          </div>
          {proposal.taxRate > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Imposto ({proposal.taxRate}%)</span>
              <span className="font-medium text-slate-700">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t border-slate-200">
            <span className="font-bold text-slate-800">Total</span>
            <span className="font-bold text-xl text-violet-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {proposal.terms && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Termos e Condições</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          <p>Proposta gerada pelo ProposalApp</p>
        </div>
      </div>
    </div>
  );
}
