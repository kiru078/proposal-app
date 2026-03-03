import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const original = await prisma.proposal.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (!original) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const duplicate = await prisma.proposal.create({
      data: {
        userId: session.user.id,
        clientName: original.clientName,
        clientEmail: original.clientEmail,
        clientCompany: original.clientCompany,
        clientPhone: original.clientPhone,
        title: `Cópia de ${original.title}`,
        coverLetter: original.coverLetter,
        notes: original.notes,
        terms: original.terms,
        taxRate: original.taxRate,
        validUntil: original.validUntil,
        publicToken: nanoid(21),
        status: "DRAFT",
        items: {
          create: original.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            order: item.order,
          })),
        },
      },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("[PROPOSAL_DUPLICATE_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
