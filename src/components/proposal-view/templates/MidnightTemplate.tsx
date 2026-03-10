import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function ItemRow({ item }: { item: TemplateProps["proposal"]["items"][0] }) {
  if (item.itemType === "percentage") {
    return (
      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <td className="px-3 md:px-5 py-3 text-gray-200 text-sm">{item.description}</td>
        <td className="px-3 md:px-5 py-3 text-center font-semibold text-emerald-400 text-sm" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="px-3 md:px-5 py-3 text-right text-gray-500 italic text-xs">A calcular</td>
      </tr>
    );
  }
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td className="px-3 md:px-5 py-3 text-gray-200 text-sm">{item.description}</td>
      <td className="px-3 md:px-5 py-3 text-center text-gray-500 text-sm">{item.quantity}</td>
      <td className="px-3 md:px-5 py-3 text-right text-gray-500 text-sm">{formatCurrency(item.unitPrice)}</td>
      <td className="px-3 md:px-5 py-3 text-right font-semibold text-white text-sm">{formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  );
}

export function MidnightTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document max-w-4xl mx-auto shadow-2xl overflow-hidden rounded-2xl" style={{ backgroundColor: "#0d0d0d" }}>
      {expired && isPublic && (
        <div className="px-5 py-3" style={{ backgroundColor: "#451a03", borderBottom: "1px solid #92400e" }}>
          <span className="text-amber-400 text-sm">⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-5 md:px-10 py-8 md:py-14" style={{ background: "linear-gradient(160deg, #111827 0%, #0d0d0d 100%)" }}>
        <div className="h-px mb-8 md:mb-10" style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1 md:pr-10">
            {proposal.proposalType && (
              <span className="inline-block text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
                {proposal.proposalType}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">{proposal.title}</h1>
            <p className="text-gray-600 text-sm mt-3 tracking-widest">#{proposal.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="md:text-right md:border-l md:pl-8" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-white font-bold text-lg">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-500 text-sm">{proposal.user.name}</p>}
            <p className="text-gray-600 text-xs mt-1 break-words">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-gray-600 text-xs">{proposal.user.phone}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 md:gap-8 mt-8 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs uppercase tracking-wider">Status</span>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <div>
            <span className="text-gray-600 text-xs uppercase tracking-wider">Data </span>
            <span className="text-gray-300 text-sm">{formatDate(proposal.createdAt)}</span>
          </div>
          {proposal.validUntil && (
            <div>
              <span className="text-gray-600 text-xs uppercase tracking-wider">Válida até </span>
              <span className={`text-sm ${expired ? "text-red-400" : "text-gray-300"}`}>{formatDate(proposal.validUntil)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10" style={{ backgroundColor: "#111111" }}>
        {/* Partes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "De", name: proposal.user.companyName || proposal.user.name, sub: proposal.user.companyName ? proposal.user.name : null, contact: proposal.user.email, extra: proposal.user.phone, addr: proposal.user.address },
            { label: "Para", name: proposal.clientName, sub: proposal.clientCompany, contact: proposal.clientEmail, extra: proposal.clientPhone, addr: null },
          ].map((party) => (
            <div key={party.label} className="rounded-xl p-4" style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">{party.label}</p>
              <p className="font-bold text-white">{party.name}</p>
              {party.sub && <p className="text-gray-500 text-sm">{party.sub}</p>}
              <p className="text-gray-600 text-sm break-words">{party.contact}</p>
              {party.extra && <p className="text-gray-600 text-sm">{party.extra}</p>}
              {party.addr && <p className="text-gray-600 text-sm">{party.addr}</p>}
            </div>
          ))}
        </div>

        {proposal.coverLetter && (
          <div className="rounded-xl p-4 md:p-6" style={{ backgroundColor: "#1a1a1a", borderLeft: "3px solid #10b981" }}>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Itens */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 whitespace-nowrap">Serviços & Produtos</h3>
            <div className="h-px flex-1" style={{ background: "rgba(16,185,129,0.2)" }} />
          </div>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full min-w-[340px]">
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  <th className="text-left px-3 md:px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Descrição</th>
                  <th className="text-center px-3 md:px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Qtd</th>
                  <th className="text-right px-3 md:px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Unitário</th>
                  <th className="text-right px-3 md:px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: "#0d0d0d" }}>
                {proposal.items.map((item) => <ItemRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-full md:w-72 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 md:px-5 py-4 space-y-2" style={{ backgroundColor: "#1a1a1a" }}>
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-300">{formatCurrency(subtotal)}</span>
              </div>
              {proposal.taxRate > 0 && (
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Imposto ({proposal.taxRate}%)</span>
                  <span className="text-gray-300">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-4 mt-2" style={{ borderTop: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-2xl md:text-3xl text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div className="rounded-xl p-4 md:p-6" style={{ backgroundColor: "#1a1a1a" }}>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Termos e Condições</p>
            <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="text-center text-xs pt-4" style={{ color: "rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          Proposta gerada pelo ProposalApp
        </div>
      </div>
    </div>
  );
}
