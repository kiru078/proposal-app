"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface ProfileFormData {
  name: string;
  companyName: string;
  phone: string;
  address: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        reset({
          name: data.name || "",
          companyName: data.companyName || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      }
      setFetching(false);
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
      return;
    }

    toast({ title: "Perfil atualizado!" });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-500 text-sm mt-1">
          Estas informações aparecerão nas suas propostas
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações pessoais</CardTitle>
            <CardDescription>
              Email: <strong>{session?.user?.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                placeholder="Sua Empresa Ltda"
                {...register("companyName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço / Cidade</Label>
              <Textarea
                id="address"
                placeholder="Rua..., Cidade - Estado"
                rows={2}
                {...register("address")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
