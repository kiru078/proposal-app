import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface RouteParams {
  params: { token: string };
}

export async function POST(_req: Request, { params }: RouteParams) {
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: params.token },
    include: { items: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  }

  if (proposal.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Proposta não aceita" }, { status: 400 });
  }

  // Calculate total in cents
  const subtotal = proposal.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (proposal.taxRate / 100);
  const total = subtotal + taxAmount;
  const totalInCents = Math.round(total * 100);

  if (totalInCents < 50) {
    return NextResponse.json({ error: "Valor mínimo é R$ 0,50" }, { status: 400 });
  }

  const baseUrl = (process.env.NEXTAUTH_URL || "https://proposal-app-silk-omega.vercel.app").replace(/\/$/, "");

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: proposal.items.map((item) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: `${item.description}${item.quantity !== 1 ? ` (x${item.quantity})` : ""}`,
          },
          // Multiply quantity into unit_amount so Stripe receives quantity=1 (avoids float issues)
          unit_amount: Math.round(item.quantity * item.unitPrice * 100),
        },
        quantity: 1,
      })),
      metadata: {
        proposalId: proposal.id,
        publicToken: proposal.publicToken,
      },
      success_url: `${baseUrl}/payment-success?token=${proposal.publicToken}`,
      cancel_url: `${baseUrl}/p/${proposal.publicToken}`,
    });
  } catch (err: any) {
    console.error("[STRIPE ERROR]", err?.message);
    return NextResponse.json({ error: err?.message || "Erro ao criar sessão de pagamento" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
