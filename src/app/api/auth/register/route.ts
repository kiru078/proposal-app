import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        companyName: data.companyName,
        phone: data.phone,
        address: data.address,
      },
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso", userId: user.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
