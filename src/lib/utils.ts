import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function computeTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate: number
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  return { subtotal, taxAmount, grandTotal };
}

export function buildPublicUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/p/${token}`;
}

export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}
