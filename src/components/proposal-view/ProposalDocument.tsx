import { ProposalData } from "./proposal-types";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { CorporateTemplate } from "./templates/CorporateTemplate";

interface ProposalDocumentProps {
  proposal: ProposalData;
  isPublic?: boolean;
}

export function ProposalDocument({ proposal, isPublic = false }: ProposalDocumentProps) {
  const template = proposal.template || "modern";

  if (template === "classic") return <ClassicTemplate proposal={proposal} isPublic={isPublic} />;
  if (template === "minimal") return <MinimalTemplate proposal={proposal} isPublic={isPublic} />;
  if (template === "corporate") return <CorporateTemplate proposal={proposal} isPublic={isPublic} />;
  return <ModernTemplate proposal={proposal} isPublic={isPublic} />;
}
