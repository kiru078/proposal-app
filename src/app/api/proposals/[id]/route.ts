import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { proposalFormSchema } from "@/lib/validations/proposal";

export async function GET(
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

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("[PROPOSAL_GET_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.proposal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const body = await req.json();

    // Handle status-only updates
    if (body.status && Object.keys(body).length === 1) {
      const updated = await prisma.proposal.update({
        where: { id: params.id },
        data: { status: body.status },
        include: { items: { orderBy: { order: "asc" } } },
      });
      return NextResponse.json(updated);
    }

    const data = proposalFormSchema.parse(body);

    // Delete old items and recreate
    await prisma.proposalItem.deleteMany({ where: { proposalId: params.id } });

    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientCompany: data.clientCompany,
        clientPhone: data.clientPhone,
        title: data.title,
        coverLetter: data.coverLetter,
        notes: data.notes,
        terms: data.terms,
        taxRate: data.taxRate,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        template: data.template,
        enablePayment: data.enablePayment,
        proposalType: data.proposalType,
        problems: data.problems,
        status: "DRAFT",
        items: {
          create: data.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            order: index,
            itemType: item.itemType,
            percentageLabel: item.percentageLabel,
          })),
        },
      },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[PROPOSAL_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.proposal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    await prisma.proposal.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Proposta excluída" });
  } catch (error) {
    console.error("[PROPOSAL_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
