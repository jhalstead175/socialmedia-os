import React from "react";
import ExecutiveModernTemplate from "./templates/ExecutiveModernTemplate";
import ExecutiveClassicTemplate from "./templates/ExecutiveClassicTemplate";
import LegalProfessionalTemplate from "./templates/LegalProfessionalTemplate";
import ConsultingEliteTemplate from "./templates/ConsultingEliteTemplate";
import FinanceExecutiveTemplate from "./templates/FinanceExecutiveTemplate";
import CreativeExecutiveTemplate from "./templates/CreativeExecutiveTemplate";

const templateComponents = {
  'executive-modern': ExecutiveModernTemplate,
  'executive-classic': ExecutiveClassicTemplate,
  'legal-professional': LegalProfessionalTemplate,
  'consulting-elite': ConsultingEliteTemplate,
  'finance-executive': FinanceExecutiveTemplate,
  'creative-executive': CreativeExecutiveTemplate,
};

export default function TemplatePreview({ template, resume, scale = 1 }) {
  const TemplateComponent = templateComponents[template] || ExecutiveModernTemplate;
  
  return (
    <div 
      className="unscale-on-print"
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`
      }}
    >
      <TemplateComponent resume={resume} />
    </div>
  );
}