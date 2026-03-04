import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function renderItemRow(item: TemplateProps["proposal"]["items"][0]) {
  if (item.itemType === "percentage") {
    return (
      <tr key={item.id} className="border-b border-gray-200">
        <td className="py-3 pr-4 text-gray-800">{item.description}</td>
        <td className="py-3 text-right text-gray-600" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="py-3 text-right text-gray-500 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr key={item.id} className="border-b border-gray-200">
      <td className="py-3 pr-4 text-gray-800">{item.description}</td>
      <td className="py-3 text-right text-gray-600">{item.quantity}</td>
      <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
      <td className="py-3 text-right font-semibold text-gray-900">
        {formatCurrency(item.quantity * item.unitPrice)}
      </td>
    </tr>
  );
}

export function ClassicTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-lg overflow-hidden">
      {expired && isPublic && (
        <div className="bg-yellow-50 border-b border-yellow-300 px-8 py-3">
          <span className="text-yellow-700 font-medium text-sm">
            ⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 px-8 py-10 text-white">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Proposta Comercial</p>
            <h1 className="text-4xl font-light tracking-wide">PROPOSTA</h1>
            <p className="text-gray-400 text-sm mt-1">Nº {proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && (
              <p className="text-gray-400 text-sm">{proposal.user.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Meta bar */}
      <div className="bg-gray-100 px-8 py-4 flex flex-wrap gap-8 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Emitida em</p>
          <p className="text-sm font-medium text-gray-700">{formatDate(proposal.createdAt)}</p>
        </div>
        {proposal.validUntil && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Válida até</p>
            <p className={`text-sm font-medium ${expired ? "text-red-600" : "text-gray-700"}`}>
              {formatDate(proposal.validUntil)}
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">Remetente</p>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
              {proposal.user.companyName && <p className="text-gray-600 text-sm">{proposal.user.name}</p>}
              <p className="text-gray-500 text-sm">{proposal.user.email}</p>
              {proposal.user.phone && <p className="text-gray-500 text-sm">{proposal.user.phone}</p>}
              {proposal.user.address && <p className="text-gray-500 text-sm">{proposal.user.address}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">Destinatário</p>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{proposal.clientName}</p>
              {proposal.clientCompany && <p className="text-gray-600 text-sm">{proposal.clientCompany}</p>}
              <p className="text-gray-500 text-sm">{proposal.clientEmail}</p>
              {proposal.clientPhone && <p className="text-gray-500 text-sm">{proposal.clientPhone}</p>}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-light text-gray-900 border-l-4 border-gray-900 pl-4">{proposal.title}</h2>

        {proposal.coverLetter && (
          <div className="border-l-2 border-gray-300 pl-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">Itens da Proposta</p>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Descrição</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Qtd</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Preço unit.</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.items.map(renderItemRow)}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-2 border-t-2 border-gray-900 pt-4">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
          </div>
          {proposal.taxRate > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-500">Imposto ({proposal.taxRate}%)</span>
              <span className="font-medium text-gray-700">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t border-gray-300">
            <span className="font-bold text-gray-900 uppercase tracking-wider text-sm">Total Geral</span>
            <span className="font-bold text-2xl text-gray-900">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {proposal.terms && (
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Termos e Condições</p>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p>Proposta gerada pelo ProposalApp</p>
        </div>
      </div>
    </div>
  );
}
