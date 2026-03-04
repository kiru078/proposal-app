export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  order: number;
  itemType?: string;
  percentageLabel?: string | null;
}

export interface Sender {
  name: string;
  email: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ProposalData {
  id: string;
  title: string;
  status: string;
  coverLetter?: string | null;
  terms?: string | null;
  notes?: string | null;
  taxRate: number;
  validUntil?: string | Date | null;
  createdAt: string | Date;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  clientPhone?: string | null;
  template?: string | null;
  enablePayment?: boolean;
  proposalType?: string | null;
  items: ProposalItem[];
  user: Sender;
}

export interface TemplateProps {
  proposal: ProposalData;
  isPublic?: boolean;
}
