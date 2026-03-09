"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proposalFormSchema, ProposalFormValues } from "@/lib/validations/proposal";
import { computeTotals, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Save, CreditCard, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPOSAL_TYPES = [
  "Dentista / Clínica Odontológica",
  "Corretor de Imóveis",
  "Advogado / Escritório Jurídico",
  "Agência de Marketing / Freelancer",
  "Desenvolvedor / TI",
  "Arquiteto / Designer de Interiores",
  "Consultor de Negócios",
  "Médico / Clínica",
  "Educação / Coaching",
  "Outra",
];

const TEMPLATES = [
  {
    id: "modern",
    name: "Moderno",
    description: "Violeta + índigo",
    preview: (
      <div className="w-full h-20 rounded-lg overflow-hidden">
        <div className="h-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}>
          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/10" />
          <div className="p-2">
            <div className="h-1.5 bg-white/80 rounded w-3/4 mb-1" />
            <div className="h-1 bg-white/40 rounded w-1/2" />
          </div>
        </div>
        <div className="h-8 bg-violet-50 p-2 flex gap-2">
          <div className="h-1.5 bg-violet-200 rounded w-1/3" />
          <div className="h-1.5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    ),
  },
  {
    id: "classic",
    name: "Clássico",
    description: "Preto + dourado",
    preview: (
      <div className="w-full h-20 rounded-lg overflow-hidden">
        <div className="h-12 bg-gray-950 p-2">
          <div className="h-0.5 bg-amber-400 w-6 mb-2" />
          <div className="h-1.5 bg-white/70 rounded w-2/3 mb-1" />
          <div className="h-1 bg-gray-600 rounded w-1/3" />
        </div>
        <div className="h-8 bg-white p-2 flex gap-2">
          <div className="h-1.5 bg-amber-200 rounded w-1/3" />
          <div className="h-1.5 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Branco + teal",
    preview: (
      <div className="w-full h-20 rounded-lg overflow-hidden border border-gray-100">
        <div className="h-1.5 bg-teal-500" />
        <div className="bg-white p-2 pt-2 space-y-1.5">
          <div className="h-1 bg-teal-400 rounded w-8" />
          <div className="h-2.5 bg-gray-900 rounded w-3/4" />
          <div className="h-1 bg-gray-200 rounded w-1/2" />
          <div className="h-1 bg-gray-100 rounded w-2/5" />
        </div>
      </div>
    ),
  },
  {
    id: "corporate",
    name: "Corporativo",
    description: "Navy + laranja",
    preview: (
      <div className="w-full h-20 rounded-lg overflow-hidden">
        <div className="h-12 p-2 flex gap-2 items-start" style={{ backgroundColor: "#0f2744" }}>
          <div className="w-0.5 h-full rounded-full" style={{ backgroundColor: "#f97316" }} />
          <div className="flex-1">
            <div className="h-1.5 bg-white/70 rounded w-2/3 mb-1" />
            <div className="h-1 rounded w-1/3" style={{ backgroundColor: "rgba(249,115,22,0.5)" }} />
          </div>
        </div>
        <div className="h-1 bg-orange-500" />
        <div className="h-7 bg-white p-1 flex gap-1.5">
          <div className="h-1.5 bg-orange-100 rounded w-1/3" />
          <div className="h-1.5 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    ),
  },
  {
    id: "vivid",
    name: "Vibrante",
    description: "Coral + rosa",
    preview: (
      <div className="w-full h-20 rounded-lg overflow-hidden">
        <div className="h-12 relative overflow-hidden p-2" style={{ background: "linear-gradient(135deg, #ef4444, #ec4899)" }}>
          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/10" />
          <div className="h-1.5 bg-white/80 rounded w-2/3 mb-1" />
          <div className="h-1 bg-white/40 rounded w-1/2" />
        </div>
        <div className="h-8 p-2 flex gap-2" style={{ background: "linear-gradient(135deg, #fff1f2, #fce7f3)" }}>
          <div className="h-1.5 rounded w-1/3" style={{ backgroundColor: "#fca5a5" }} />
          <div className="h-1.5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    ),
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark + esmeralda",
    preview: (
      <div className="w-full h-20 rounded-lg overflow-hidden">
        <div className="h-12 p-2" style={{ backgroundColor: "#111827" }}>
          <div className="h-0.5 mb-2 rounded" style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />
          <div className="h-1.5 bg-white/70 rounded w-2/3 mb-1" />
          <div className="h-1 bg-gray-700 rounded w-1/3" />
        </div>
        <div className="h-8 p-2 flex gap-2" style={{ backgroundColor: "#1a1a1a" }}>
          <div className="h-1.5 rounded w-1/3" style={{ backgroundColor: "#065f46" }} />
          <div className="h-1.5 rounded w-1/4" style={{ backgroundColor: "#1f2937" }} />
        </div>
      </div>
    ),
  },
];

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
    setValue,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      taxRate: 0,
      template: "modern",
      enablePayment: true,
      items: [{ description: "", quantity: 1, unitPrice: 0, order: 0, itemType: "fixed" }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate");
  const watchedTemplate = watch("template");
  const watchedEnablePayment = watch("enablePayment");

  const fixedItems = (watchedItems || []).filter((i) => i.itemType !== "percentage");
  const totals = computeTotals(
    fixedItems.map((item) => ({
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
      toast({ title: "Erro ao salvar proposta", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: isEditing ? "Proposta atualizada!" : "Proposta criada!" });
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

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template da Proposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setValue("template", tmpl.id as any)}
                className={cn(
                  "rounded-lg border-2 p-3 text-left transition-all hover:border-violet-400",
                  watchedTemplate === tmpl.id
                    ? "border-violet-600 bg-violet-50"
                    : "border-slate-200"
                )}
              >
                {tmpl.preview}
                <p className="mt-2 text-sm font-semibold text-slate-800">{tmpl.name}</p>
                <p className="text-xs text-slate-500">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proposal Type + Payment Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proposal Type */}
          <div className="space-y-2">
            <Label>Tipo de proposta</Label>
            <Controller
              control={control}
              name="proposalType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de proposta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Payment Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 rounded-md p-2">
                <CreditCard className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Pagamento online</p>
                <p className="text-xs text-slate-500">
                  Permite que o cliente pague ao aceitar a proposta
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue("enablePayment", !watchedEnablePayment)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                watchedEnablePayment ? "bg-violet-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  watchedEnablePayment ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do cliente *</Label>
            <Input id="clientName" placeholder="João Silva" {...register("clientName")} />
            {errors.clientName && (
              <p className="text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email do cliente *</Label>
            <Input id="clientEmail" type="email" placeholder="joao@empresa.com" {...register("clientEmail")} />
            {errors.clientEmail && (
              <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientCompany">Empresa</Label>
            <Input id="clientCompany" placeholder="Empresa do Cliente" {...register("clientCompany")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Telefone</Label>
            <Input id="clientPhone" placeholder="(11) 99999-9999" {...register("clientPhone")} />
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
              <Input id="title" placeholder="Proposta de Desenvolvimento Web" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Válida até</Label>
              <Input id="validUntil" type="date" {...register("validUntil")} />
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
          {fields.map((field, index) => {
            const itemType = watchedItems?.[index]?.itemType || "fixed";
            const isPercentage = itemType === "percentage";

            return (
              <div key={field.id} className="border border-slate-100 rounded-lg p-3 space-y-3">
                {/* Type toggle + description row */}
                <div className="flex gap-2 items-start">
                  {/* Type toggle */}
                  <div className="flex rounded-md border border-slate-200 overflow-hidden flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setValue(`items.${index}.itemType`, "fixed")}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors",
                        !isPercentage
                          ? "bg-violet-600 text-white"
                          : "bg-white text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <DollarSign className="h-3 w-3" />
                      Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue(`items.${index}.itemType`, "percentage")}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors",
                        isPercentage
                          ? "bg-violet-600 text-white"
                          : "bg-white text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Percent className="h-3 w-3" />
                      %
                    </button>
                  </div>

                  {/* Description */}
                  <div className="flex-1">
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

                  {/* Delete */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-slate-400 hover:text-destructive flex-shrink-0"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Fixed item: qty + price */}
                {!isPercentage && (
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500">Quantidade</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1"
                        {...register(`items.${index}.quantity`)}
                        className="text-right"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500">Preço unitário (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...register(`items.${index}.unitPrice`)}
                        className="text-right"
                      />
                    </div>
                    <div className="flex-1 pt-5 text-right text-sm text-slate-500">
                      = {formatCurrency(
                        (Number(watchedItems?.[index]?.quantity) || 0) *
                        (Number(watchedItems?.[index]?.unitPrice) || 0)
                      )}
                    </div>
                  </div>
                )}

                {/* Percentage item: % + label */}
                {isPercentage && (
                  <div className="flex gap-2 items-center">
                    <div className="w-32">
                      <Label className="text-xs text-slate-500">Percentual (%)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="2"
                          {...register(`items.${index}.quantity`)}
                          className="text-right pr-7"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500">Sobre o quê? (ex: vendas do mês)</Label>
                      <Input
                        placeholder="vendas do mês, valor do contrato..."
                        {...register(`items.${index}.percentageLabel`)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {errors.items && !Array.isArray(errors.items) && (
            <p className="text-sm text-destructive">{(errors.items as any).message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ description: "", quantity: 1, unitPrice: 0, order: fields.length, itemType: "fixed" })
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
              <span className="text-slate-500">Subtotal (itens fixos)</span>
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
        <Button type="button" variant="outline" onClick={() => router.back()}>
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
