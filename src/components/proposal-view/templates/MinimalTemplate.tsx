import { formatCurrency, formatDate, computeTotals, isExpired } from "@/lib/utils";
import { ProposalStatusBadge } from "@/components/dashboard/ProposalStatusBadge";
import { TemplateProps } from "../proposal-types";

function ItemRow({ item }: { item: TemplateProps["proposal"]["items"][0] }) {
  if (item.itemType === "percentage") {
    return (
      <tr className="border-b border-gray-50">
        <td className="py-5 pr-4 text-gray-700">{item.description}</td>
        <td className="py-5 text-center text-teal-500 font-medium" colSpan={2}>
          {item.quantity}% sobre {item.percentageLabel || "—"}
        </td>
        <td className="py-5 text-right text-gray-300 italic text-sm">A calcular</td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-gray-50">
      <td className="py-5 pr-4 text-gray-700">{item.description}</td>
      <td className="py-5 text-center text-gray-400">{item.quantity}</td>
      <td className="py-5 text-right text-gray-400">{formatCurrency(item.unitPrice)}</td>
      <td className="py-5 text-right font-semibold text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  );
}

export function MinimalTemplate({ proposal, isPublic = false }: TemplateProps) {
  const fixedItems = proposal.items.filter((i) => i.itemType !== "percentage");
  const { subtotal, taxAmount, grandTotal } = computeTotals(fixedItems, proposal.taxRate);
  const expired = isExpired(proposal.validUntil);

  return (
    <div className="proposal-document bg-white max-w-4xl mx-auto">
      {/* Barra teal no topo */}
      <div className="h-1.5 bg-teal-500" />

      {expired && isPublic && (
        <div className="bg-amber-50 border-b border-amber-100 px-12 py-3">
          <span className="text-amber-600 text-sm">⚠️ Esta proposta venceu em {formatDate(proposal.validUntil)}</span>
        </div>
      )}

      <div className="px-12 py-14 space-y-14">
        {/* Header: título oversized */}
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-10">
            <p className="text-teal-500 text-xs uppercase tracking-[0.3em] font-bold mb-5">Proposta Comercial</p>
            <h1 className="text-6xl font-extralight text-gray-900 leading-none tracking-tight">{proposal.title}</h1>
            <div className="flex items-center gap-6 mt-6">
              <ProposalStatusBadge status={proposal.status} />
              <span className="text-gray-300 text-xs">#{proposal.id.slice(-8).toUpperCase()}</span>
              <span className="text-gray-400 text-xs">{formatDate(proposal.createdAt)}</span>
              {proposal.validUntil && (
                <span className={`text-xs ${expired ? "text-red-400" : "text-gray-400"}`}>
                  Válida até {formatDate(proposal.validUntil)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right border-l border-gray-100 pl-10">
            <p className="font-semibold text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-400 text-sm">{proposal.user.name}</p>}
            <p className="text-gray-300 text-xs mt-1">{proposal.user.email}</p>
            {proposal.user.phone && <p className="text-gray-300 text-xs">{proposal.user.phone}</p>}
          </div>
        </div>

        {/* Partes */}
        <div className="grid grid-cols-2 gap-12 py-8 border-y border-gray-50">
          <div>
            <p className="text-teal-500 text-xs uppercase tracking-[0.25em] font-bold mb-4">De</p>
            <p className="font-semibold text-gray-900">{proposal.user.companyName || proposal.user.name}</p>
            {proposal.user.companyName && <p className="text-gray-400 text-sm mt-1">{proposal.user.name}</p>}
            <p className="text-gray-300 text-sm">{proposal.user.email}</p>
            {proposal.user.address && <p className="text-gray-300 text-sm">{proposal.user.address}</p>}
          </div>
          <div>
            <p className="text-teal-500 text-xs uppercase tracking-[0.25em] font-bold mb-4">Para</p>
            <p className="font-semibold text-gray-900">{proposal.clientName}</p>
            {proposal.clientCompany && <p className="text-gray-400 text-sm mt-1">{proposal.clientCompany}</p>}
            <p className="text-gray-300 text-sm">{proposal.clientEmail}</p>
            {proposal.clientPhone && <p className="text-gray-300 text-sm">{proposal.clientPhone}</p>}
          </div>
        </div>

        {proposal.coverLetter && (
          <p className="text-gray-500 whitespace-pre-wrap leading-loose text-lg font-light">{proposal.coverLetter}</p>
        )}

        {/* Itens */}
        <div>
          <p className="text-xs text-teal-500 uppercase tracking-[0.3em] font-bold mb-6">Serviços & Produtos</p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="text-left pb-4 text-xs text-gray-400 uppercase tracking-wider font-normal">Descrição</th>
                <th className="text-center pb-4 text-xs text-gray-400 uppercase tracking-wider font-normal">Qtd</th>
                <th className="text-right pb-4 text-xs text-gray-400 uppercase tracking-wider font-normal">Unitário</th>
                <th className="text-right pb-4 text-xs text-gray-400 uppercase tracking-wider font-normal">Total</th>
              </tr>
            </thead>
            <tbody>{proposal.items.map((item) => <ItemRow key={item.id} item={item} />)}</tbody>
          </table>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-64">
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
            <div className="flex justify-between items-baseline pt-4 border-t border-gray-900 mt-2">
              <span className="text-gray-500 text-sm font-medium">Total</span>
              <span className="font-extralight text-4xl text-teal-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {proposal.terms && (
          <div className="pt-4">
            <p className="text-teal-500 text-xs uppercase tracking-[0.3em] font-bold mb-4">Termos</p>
            <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-200 border-t border-gray-50 pt-8">
          Proposta gerada pelo ProposalApp
        </div>
      </div>
    </div>
  );
}
