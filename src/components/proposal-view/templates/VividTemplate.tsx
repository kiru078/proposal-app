import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function ItemRow({ item }: { item: TemplateProps["proposal"]["items"][0] }) {
  if (item.itemType === "percentage") {
    return (
      <tr className="border-b border-gray-100">
        <td className="px-5 py-4 text-gray-800">{item.description}</td>
        <td className="px-5 py-4 text-center font-semibold" style={{ color: "#ef4444" }} colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="px-5 py-4 text-right text-gray-400 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-gray-100">
      <td className="px-5 py-4 text-gray-800">{item.description}</td>
      <td className="px-5 py-4 text-center text-gray-500">{item.quantity}</td>
      <td className="px-5 py-4 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
      <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  );
}

export function VividTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto shadow-2xl overflow-hidden rounded-2xl">
      {expired && isPublic && (
        <div className="bg-amber-50 border-b border-amber-200 px-10 py-3">
          <span className="text-amber-700 text-sm">⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}</span>
        </div>
      )}

      {/* Header: coral + formas */}
      <div className="relative overflow-hidden px-10 py-14" style={{ background: "linear-gradient(135deg, #ef4444 0%, #ec4899 100%)" }}>
        {/* Forma decorativa */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -40%)" }} />
        <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full opacity-15" style={{ background: "white", transform: "translateY(40%)" }} />

        <div className="relative">
          {/* Tag de tipo */}
          {proposal.proposalType && (
            <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              {proposal.proposalType}
            </span>
          )}
          <h1 className="text-5xl font-black text-white leading-none mb-4">{proposal.title}</h1>
          <div className="flex items-center gap-4 mt-4">
            <ProposalStatusBadge status={proposal.status} />
            <span className="text-pink-200 text-sm">{formatDate(proposal.createdAt)}</span>
            {proposal.validUntil && (
              <span className={`text-sm ${expired ? "text-red-200 line-through" : "text-pink-200"}`}>
                Válida até {formatDate(proposal.validUntil)}
              </span>
            )}
          </div>
        </div>

        {/* Card da empresa no canto */}
        <div className="absolute bottom-8 right-10 text-right">
          <p className="text-white font-bold text-lg">{proposal.user.companyName || proposal.user.name}</p>
          {proposal.user.companyName && <p className="text-pink-200 text-sm">{proposal.user.name}</p>}
          <p className="text-pink-300 text-xs">{proposal.user.email}</p>
        </div>
      </div>

      <div className="px-10 py-10 space-y-10">
        {/* Partes */}
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #fff1f2, #fce7f3)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>De</p>
            <p className="font-bold text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-500 text-sm">{proposal.user.name}</p>}
            <p className="text-gray-400 text-sm">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-gray-400 text-sm">{proposal.user.phone}</p>}
            {proposal.user.address && <p className="text-gray-400 text-sm">{proposal.user.address}</p>}
          </div>
          <div className="rounded-2xl p-5 bg-gray-50">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>Para</p>
            <p className="font-bold text-gray-900">{proposal.clientName}</p>
            {proposal.clientCompany && <p className="text-gray-500 text-sm">{proposal.clientCompany}</p>}
            <p className="text-gray-400 text-sm">{proposal.clientEmail}</p>
            {proposal.clientPhone && <p className="text-gray-400 text-sm">{proposal.clientPhone}</p>}
          </div>
        </div>

        {proposal.coverLetter && (
          <div className="rounded-2xl p-6 bg-gray-50">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
          </div>
        )}

        {/* Itens */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Serviços & Produtos</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #ef4444, #ec4899)" }}>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Descrição</th>
                  <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Qtd</th>
                  <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Unitário</th>
                  <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Total</th>
                </tr>
              </thead>
              <tbody>{proposal.items.map((item) => <ItemRow key={item.id} item={item} />)}</tbody>
            </table>
          </div>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-72 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #fff1f2, #fce7f3)" }}>
            <div className="px-6 py-5 space-y-2">
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
              <div className="flex justify-between items-baseline pt-4 border-t border-pink-100 mt-2">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-3xl" style={{ color: "#ef4444" }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div className="rounded-2xl bg-gray-50 p-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>Termos e Condições</p>
            <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-300 pt-4 border-t border-gray-50">
          Proposta gerada pelo ProposalApp
        </div>
      </div>
    </div>
  );
}
