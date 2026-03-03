"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proposalFormSchema, ProposalFormValues } from "@/lib/validations/proposal";
import { computeTotals, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Save } from "lucide-react";

interface ProposalFormProps {
  proposalId?: string;
  defaultValues?: Partial<ProposalFormValues>;
  senderInfo?: {
    name: string;
    email: string;
    companyName?: string | null;
    phone?: string | null;
    address?: string | null;
  };
}

export function ProposalForm({ proposalId, defaultValues, senderInfo }: ProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!proposalId;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      taxRate: 0,
      items: [{ description: "", quantity: 1, unitPrice: 0, order: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate");

  const totals = computeTotals(
    (watchedItems || []).map((item) => ({
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    })),
    Number(watchedTaxRate) || 0
  );

  const onSubmit = async (data: ProposalFormValues) => {
    setLoading(true);
    const payload = {
      ...data,
      items: data.items.map((item, index) => ({ ...item, order: index })),
    };

    const res = await fetch(
      isEditing ? `/api/proposals/${proposalId}` : "/api/proposals",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast({
        title: "Erro ao salvar proposta",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isEditing ? "Proposta atualizada!" : "Proposta criada!",
    });
    router.push(`/proposals/${result.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sender Info */}
      {senderInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remetente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
              <p className="font-semibold text-slate-800">{senderInfo.companyName || senderInfo.name}</p>
              {senderInfo.companyName && <p className="text-slate-600">{senderInfo.name}</p>}
              <p className="text-slate-500">{senderInfo.email}</p>
              {senderInfo.phone && <p className="text-slate-500">{senderInfo.phone}</p>}
              {senderInfo.address && <p className="text-slate-500">{senderInfo.address}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do cliente *</Label>
            <Input
              id="clientName"
              placeholder="João Silva"
              {...register("clientName")}
            />
            {errors.clientName && (
              <p className="text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email do cliente *</Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="joao@empresa.com"
              {...register("clientEmail")}
            />
            {errors.clientEmail && (
              <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientCompany">Empresa</Label>
            <Input
              id="clientCompany"
              placeholder="Empresa do Cliente"
              {...register("clientCompany")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Telefone</Label>
            <Input
              id="clientPhone"
              placeholder="(11) 99999-9999"
              {...register("clientPhone")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Proposal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Título da proposta *</Label>
              <Input
                id="title"
                placeholder="Proposta de Desenvolvimento Web"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Válida até</Label>
              <Input
                id="validUntil"
                type="date"
                {...register("validUntil")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Carta de apresentação</Label>
            <Textarea
              id="coverLetter"
              placeholder="Olá! Estamos felizes em apresentar nossa proposta para o seu projeto..."
              rows={4}
              {...register("coverLetter")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <div className="col-span-6">Descrição</div>
            <div className="col-span-2 text-right">Qtd</div>
            <div className="col-span-3 text-right">Preço unit.</div>
            <div className="col-span-1" />
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-12 md:col-span-6">
                <Input
                  placeholder="Descrição do serviço ou produto"
                  {...register(`items.${index}.description`)}
                />
                {errors.items?.[index]?.description && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>
              <div className="col-span-5 md:col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Qtd"
                  {...register(`items.${index}.quantity`)}
                  className="text-right"
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...register(`items.${index}.unitPrice`)}
                  className="text-right"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-slate-400 hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* Subtotal for this row */}
              <div className="col-span-11 md:col-span-6 col-start-1 md:col-start-7 text-right text-sm text-slate-500 px-2">
                Subtotal: {formatCurrency(
                  (Number(watchedItems?.[index]?.quantity) || 0) *
                  (Number(watchedItems?.[index]?.unitPrice) || 0)
                )}
              </div>
            </div>
          ))}

          {errors.items && !Array.isArray(errors.items) && (
            <p className="text-sm text-destructive">{(errors.items as any).message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ description: "", quantity: 1, unitPrice: 0, order: fields.length })
            }
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar item
          </Button>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 ml-auto max-w-xs">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">Imposto (%)</span>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="w-20 text-right h-8"
                {...register("taxRate")}
              />
              <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Termos e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Termos e condições</Label>
            <Textarea
              id="terms"
              placeholder="Pagamento em 30 dias. Validade da proposta: 30 dias..."
              rows={4}
              {...register("terms")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              placeholder="Observações internas (não serão exibidas ao cliente)..."
              rows={3}
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? "Salvar alterações" : "Criar proposta"}
        </Button>
      </div>
    </form>
  );
}
