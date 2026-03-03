"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-100 rounded-full p-4">
            <BadgeCheck className="h-12 w-12 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pagamento confirmado!</h1>
        <p className="text-slate-500 mb-6">
          Seu pagamento foi processado com sucesso. Em breve você receberá uma confirmação por e-mail.
        </p>
        {token && (
          <Link href={`/p/${token}`}>
            <Button variant="outline" className="w-full">
              Ver proposta
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
