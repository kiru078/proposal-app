import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, companyName: true, phone: true, address: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, companyName, phone, address } = body;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, companyName, phone, address },
      select: { id: true, name: true, email: true, companyName: true, phone: true, address: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
