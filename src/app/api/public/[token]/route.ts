import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { publicToken: params.token },
      include: {
        items: { orderBy: { order: "asc" } },
        user: {
          select: {
            id: true, name: true, email: true,
            companyName: true, phone: true, address: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    // Auto-update to VIEWED when first opened after SENT
    if (proposal.status === "SENT") {
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: "VIEWED", viewedAt: new Date() },
      });
      proposal.status = "VIEWED";
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("[PUBLIC_PROPOSAL_GET_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { publicToken: params.token },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const updated = await prisma.proposal.update({
      where: { publicToken: params.token },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUBLIC_PROPOSAL_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
