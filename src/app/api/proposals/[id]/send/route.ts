import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPublicUrl } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const proposal = await prisma.proposal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: { status: "SENT", sentAt: new Date() },
    });

    const publicUrl = buildPublicUrl(updated.publicToken);

    return NextResponse.json({ proposal: updated, publicUrl });
  } catch (error) {
    console.error("[PROPOSAL_SEND_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
