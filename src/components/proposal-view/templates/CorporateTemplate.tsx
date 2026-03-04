import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function renderItemRow(item: TemplateProps["proposal"]["items"][0]) {
  if (item.itemType === "percentage") {
    return (
      <tr key={item.id} className="even:bg-blue-50/30">
        <td className="px-4 py-3 text-gray-800">{item.description}</td>
        <td className="px-4 py-3 text-right text-gray-600" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="px-4 py-3 text-right text-gray-400 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr key={item.id} className="even:bg-blue-50/30">
      <td className="px-4 py-3 text-gray-800">{item.description}</td>
      <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
      <td className="px-4 py-3 text-right font-semibold text-gray-900">
        {formatCurrency(item.quantity * item.unitPrice)}
      </td>
    </tr>
  );
}

export function CorporateTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-lg rounded overflow-hidden">
      {expired && isPublic && (
        <div className="bg-yellow-50 border-b border-yellow-300 px-8 py-3">
          <span className="text-yellow-700 font-medium text-sm">
            ⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: "#1e3a5f" }} className="px-8 py-10 text-white">
        <div className="grid grid-cols-2 gap-8 items-end">
          {/* Left: company */}
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">Apresentado por</p>
            <p className="text-2xl font-bold">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && (
              <p className="text-blue-200 text-sm mt-1">{proposal.user.name}</p>
            )}
            <p className="text-blue-300 text-sm">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-blue-300 text-sm">{proposal.user.phone}</p>}
          </div>
          {/* Right: proposal info */}
          <div className="text-right">
            <h1 className="text-4xl font-black tracking-tight">PROPOSTA</h1>
            <p className="text-blue-300 text-sm mt-1">#{proposal.id.slice(-8).toUpperCase()}</p>
            <div className="mt-3">
              <p className="text-blue-200 text-xs uppercase tracking-wider">Data</p>
              <p className="text-white text-sm">{formatDate(proposal.createdAt)}</p>
            </div>
            {proposal.validUntil && (
              <div className="mt-2">
                <p className="text-blue-200 text-xs uppercase tracking-wider">Válida até</p>
                <p className={`text-sm ${expired ? "text-red-300" : "text-white"}`}>
                  {formatDate(proposal.validUntil)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-blue-50 border-b border-blue-100 px-8 py-3 flex items-center gap-3">
        <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Status:</span>
        <ProposalStatusBadge status={proposal.status} />
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Client info */}
        <div style={{ backgroundColor: "#f0f4f8" }} className="rounded-lg p-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#1e3a5f" }}>
            Apresentado Para
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-lg">{proposal.clientName}</p>
              {proposal.clientCompany && <p className="text-gray-600">{proposal.clientCompany}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-gray-600 text-sm">{proposal.clientEmail}</p>
              {proposal.clientPhone && <p className="text-gray-600 text-sm">{proposal.clientPhone}</p>}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{proposal.title}</h2>

        {proposal.coverLetter && (
          <div className="border-l-4 pl-6 py-2" style={{ borderColor: "#1e3a5f" }}>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <div className="px-4 py-3 rounded-t-lg text-white text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: "#1e3a5f" }}>
            Escopo de Serviços
          </div>
          <table className="w-full border border-blue-100 border-t-0">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-blue-800 uppercase tracking-wider">Descrição</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-blue-800 uppercase tracking-wider">Qtd</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-blue-800 uppercase tracking-wider">Unitário</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-blue-800 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {proposal.items.map(renderItemRow)}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-sm">
          <div className="bg-blue-50 rounded-lg p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
            </div>
            {proposal.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Imposto ({proposal.taxRate}%)</span>
                <span className="font-medium text-gray-700">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-blue-200">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-sm">Total</span>
              <span className="font-black text-2xl" style={{ color: "#1e3a5f" }}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#1e3a5f" }}>
              Termos e Condições
            </p>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="border-t pt-6 text-center text-xs text-gray-400" style={{ borderColor: "#e2e8f0" }}>
          <p>Proposta gerada pelo ProposalApp</p>
        </div>
      </div>
    </div>
  );
}
