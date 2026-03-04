import { z } from "zod";

export const proposalItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unitPrice: z.coerce.number().min(0, "Preço não pode ser negativo"),
  order: z.number().int().default(0),
  itemType: z.enum(["fixed", "percentage"]).default("fixed"),
  percentageLabel: z.string().optional(),
});

export const proposalFormSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  clientEmail: z.string().email("Email do cliente inválido"),
  clientCompany: z.string().optional(),
  clientPhone: z.string().optional(),

  title: z.string().min(1, "Título da proposta é obrigatório"),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),

  taxRate: z.coerce.number().min(0).max(100).default(0),
  validUntil: z.string().optional(),

  template: z.enum(["modern", "classic", "minimal", "corporate"]).default("modern"),
  enablePayment: z.boolean().default(true),
  proposalType: z.string().optional(),

  items: z
    .array(proposalItemSchema)
    .min(1, "Adicione pelo menos um item à proposta"),
});

export type ProposalFormValues = z.infer<typeof proposalFormSchema>;
export type ProposalItemValues = z.infer<typeof proposalItemSchema>;
