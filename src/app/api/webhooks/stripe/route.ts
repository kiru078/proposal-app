import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // If no webhook secret configured, just update via metadata
  let event: Stripe.Event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const publicToken = session.metadata?.publicToken;

    if (publicToken) {
      await prisma.proposal.update({
        where: { publicToken },
        data: { status: "PAID" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
