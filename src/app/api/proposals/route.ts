import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { proposalFormSchema } from "@/lib/validations/proposal";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const proposals = await prisma.proposal.findMany({
      where: {
        userId: session.user.id,
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        items: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("[PROPOSALS_GET_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const data = proposalFormSchema.parse(body);

    const proposal = await prisma.proposal.create({
      data: {
        userId: session.user.id,
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
        publicToken: nanoid(21),
        template: data.template,
        enablePayment: data.enablePayment,
        proposalType: data.proposalType,
        problems: data.problems,
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
      include: {
        items: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[PROPOSALS_POST_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
