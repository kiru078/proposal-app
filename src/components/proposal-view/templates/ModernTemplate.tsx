import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function ItemRow({ item }: { item: TemplateProps["proposal"]["items"][0] }) {
  if (item.itemType === "percentage") {
    return (
      <tr className="border-b border-violet-50">
        <td className="px-5 py-4 text-gray-800">{item.description}</td>
        <td className="px-5 py-4 text-center text-violet-600 font-semibold" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="px-5 py-4 text-right text-gray-400 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-violet-50 hover:bg-violet-50/40 transition-colors">
      <td className="px-5 py-4 text-gray-800">{item.description}</td>
      <td className="px-5 py-4 text-center text-gray-500">{item.quantity}</td>
      <td className="px-5 py-4 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
      <td className="px-5 py-4 text-right font-semibold text-gray-900">
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
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-2xl overflow-hidden" style={{ borderRadius: "16px" }}>
      {expired && isPublic && (
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-3">
          <span className="text-amber-700 font-medium text-sm">⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}</span>
        </div>
      )}

      {/* Header: full-bleed com gradiente e formas geométricas */}
      <div className="relative overflow-hidden px-10 py-14" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)" }}>
        {/* Círculo decorativo */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.3)" }} />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.4)", transform: "translate(-50%, 50%)" }} />

        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-violet-200 text-xs uppercase tracking-widest font-semibold mb-3">Proposta Comercial</p>
            <h1 className="text-5xl font-black text-white leading-none mb-2">{proposal.title}</h1>
            <p className="text-violet-300 text-sm mt-3">#{proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4">
            <p className="text-white font-bold text-lg">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-violet-200 text-sm">{proposal.user.name}</p>}
            <p className="text-violet-300 text-xs mt-1">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-violet-300 text-xs">{proposal.user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Barra de status */}
      <div className="flex flex-wrap gap-8 px-10 py-4 bg-violet-50 border-b border-violet-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Status</span>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        <div>
          <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Data </span>
          <span className="text-sm text-gray-700">{formatDate(proposal.createdAt)}</span>
        </div>
        {proposal.validUntil && (
          <div>
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Válida até </span>
            <span className={`text-sm ${expired ? "text-red-500 font-semibold" : "text-gray-700"}`}>{formatDate(proposal.validUntil)}</span>
          </div>
        )}
      </div>

      <div className="px-10 py-10 space-y-10">
        {/* Partes */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3">De</p>
            <p className="font-bold text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-500 text-sm">{proposal.user.name}</p>}
            <p className="text-gray-400 text-sm">{proposal.user.email}</p>
            {proposal.user.address && <p className="text-gray-400 text-sm">{proposal.user.address}</p>}
          </div>
          <div className="bg-violet-50 rounded-xl p-5">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3">Para</p>
            <p className="font-bold text-gray-900">{proposal.clientName}</p>
            {proposal.clientCompany && <p className="text-gray-500 text-sm">{proposal.clientCompany}</p>}
            <p className="text-gray-400 text-sm">{proposal.clientEmail}</p>
            {proposal.clientPhone && <p className="text-gray-400 text-sm">{proposal.clientPhone}</p>}
          </div>
        </div>

        {proposal.coverLetter && (
          <div className="border-l-4 border-violet-500 pl-6 py-1">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Itens */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-100" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Serviços & Produtos</h3>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-violet-100 uppercase tracking-wider">Descrição</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-violet-100 uppercase tracking-wider">Qtd</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-violet-100 uppercase tracking-wider">Unitário</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-violet-100 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>{proposal.items.map((item) => <ItemRow key={item.id} item={item} />)}</tbody>
            </table>
          </div>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="bg-gray-50 rounded-xl p-6 w-72">
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
            </div>
            {proposal.taxRate > 0 && (
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-gray-500">Imposto ({proposal.taxRate}%)</span>
                <span className="font-medium text-gray-700">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-black text-2xl text-violet-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Termos e Condições</h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-300 pt-4 border-t border-gray-50">
          Proposta gerada pelo ProposalApp
        </div>
      </div>
    </div>
  );
}
