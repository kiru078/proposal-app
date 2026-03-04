import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProposalForm } from "@/components/proposal-form/ProposalForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default async function EditProposalPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const proposal = await prisma.proposal.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!proposal) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true, phone: true, address: true },
  });

  const defaultValues = {
    clientName: proposal.clientName,
    clientEmail: proposal.clientEmail,
    clientCompany: proposal.clientCompany || undefined,
    clientPhone: proposal.clientPhone || undefined,
    title: proposal.title,
    coverLetter: proposal.coverLetter || undefined,
    notes: proposal.notes || undefined,
    terms: proposal.terms || undefined,
    taxRate: proposal.taxRate,
    validUntil: proposal.validUntil
      ? new Date(proposal.validUntil).toISOString().split("T")[0]
      : undefined,
    template: (proposal.template as any) || "modern",
    enablePayment: proposal.enablePayment,
    proposalType: proposal.proposalType || undefined,
    items: proposal.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      order: item.order,
      itemType: (item.itemType as any) || "fixed",
      percentageLabel: item.percentageLabel || undefined,
    })),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/proposals/${params.id}`}
          className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Proposta</h1>
          <p className="text-slate-500 text-sm">{proposal.title}</p>
        </div>
      </div>

      <ProposalForm
        proposalId={params.id}
        defaultValues={defaultValues}
        senderInfo={user ? { ...user, name: user.name ?? "" } : undefined}
      />
    </div>
  );
}
