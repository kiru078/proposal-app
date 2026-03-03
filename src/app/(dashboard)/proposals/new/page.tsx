import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProposalForm } from "@/components/proposal-form/ProposalForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewProposalPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true, phone: true, address: true },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Proposta</h1>
          <p className="text-slate-500 text-sm">Preencha os dados para criar sua proposta</p>
        </div>
      </div>

      <ProposalForm
        senderInfo={user || undefined}
      />
    </div>
  );
}
