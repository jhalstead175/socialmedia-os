import React from "react";
import { format } from "date-fns";

export default function LegalProfessionalTemplate({ resume }) {
  const { personal_info, experience, education, skills, certifications } = resume;

  return (
    <div className="w-full h-[11in] bg-white text-slate-900 p-12 font-sans" style={{ fontSize: '9pt', lineHeight: '1.4' }}>
      {/* Header with Law Firm Styling */}
      <div className="mb-6 pb-4" style={{ borderBottom: '3px solid #2D3748' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748', fontFamily: 'serif', letterSpacing: '0.02em' }}>
          {personal_info?.full_name}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            {personal_info?.email && <div>Email: {personal_info.email}</div>}
            {personal_info?.phone && <div>Phone: {personal_info.phone}</div>}
          </div>
          <div>
            {personal_info?.location && <div>Address: {personal_info.location}</div>}
            {personal_info?.linkedin && <div>LinkedIn: {personal_info.linkedin}</div>}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {personal_info?.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2 uppercase tracking-wide pb-1" 
              style={{ color: '#2D3748', borderBottom: '1px solid #E2E8F0' }}>
            Professional Summary
          </h2>
          <p className="text-justify">{personal_info.summary}</p>
        </div>
      )}

      {/* Bar Admissions / Certifications First for Legal */}
      {certifications?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2 uppercase tracking-wide pb-1" 
              style={{ color: '#2D3748', borderBottom: '1px solid #E2E8F0' }}>
            Bar Admissions & Certifications
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {certifications.map((cert, index) => (
              <div key={index} className="text-sm">
                <span className="font-semibold">{cert.name}</span>
                {cert.issuer && <span> - {cert.issuer}</span>}
                {cert.date && <span> ({format(new Date(cert.date), 'yyyy')})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Experience */}
      {experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2 uppercase tracking-wide pb-1" 
              style={{ color: '#2D3748', borderBottom: '1px solid #E2E8F0' }}>
            Legal Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h3 className="font-bold text-sm" style={{ color: '#2D3748' }}>{exp.position}</h3>
                  <p className="text-sm font-semibold">{exp.company}</p>
                  {exp.location && <p className="text-xs text-slate-600">{exp.location}</p>}
                </div>
                <div className="text-xs text-slate-600 text-right">
                  {exp.start_date && format(new Date(exp.start_date), 'MMM yyyy')} - {
                    exp.current ? 'Present' : 
                    exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'
                  }
                </div>
              </div>
              {exp.achievements && (
                <ul className="mt-2 space-y-0.5">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm pl-3" style={{ textIndent: '-0.75rem' }}>
                      <span className="mr-2">▪</span>{achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2 uppercase tracking-wide pb-1" 
              style={{ color: '#2D3748', borderBottom: '1px solid #E2E8F0' }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold text-sm">{edu.degree}{edu.field && `, ${edu.field}`}</div>
                  <div className="text-sm">{edu.institution}</div>
                  {edu.honors && <div className="text-sm italic">{edu.honors}</div>}
                  {edu.gpa && parseFloat(edu.gpa) >= 3.5 && <div className="text-sm">GPA: {edu.gpa}</div>}
                </div>
                {edu.graduation_year && (
                  <div className="text-sm">{edu.graduation_year}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Areas of Practice / Skills */}
      {skills?.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-2 uppercase tracking-wide pb-1" 
              style={{ color: '#2D3748', borderBottom: '1px solid #E2E8F0' }}>
            Areas of Practice
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="text-sm">• {skill}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}