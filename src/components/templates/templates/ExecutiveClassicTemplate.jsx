import React from "react";
import { format } from "date-fns";

export default function ExecutiveClassicTemplate({ resume }) {
  const { personal_info, experience, education, skills, certifications } = resume;

  return (
    <div className="w-full h-[11in] bg-white text-slate-900 p-12 font-serif unscale-on-print" style={{ fontSize: '11pt', lineHeight: '1.5' }}>
      {/* Header Section - More conservative styling */}
      <div className="text-center mb-8 pb-4 border-b-2 border-slate-800">
        <h1 className="text-3xl font-bold mb-3 tracking-wide" style={{ color: '#1A2F4B' }}>
          {personal_info?.full_name?.toUpperCase()}
        </h1>
        <div className="text-sm text-slate-700 space-y-1">
          <div>{personal_info?.email} | {personal_info?.phone}</div>
          <div>{personal_info?.location}</div>
          {personal_info?.linkedin && <div>{personal_info.linkedin}</div>}
        </div>
      </div>

      {/* Professional Summary */}
      {personal_info?.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-center border-b border-slate-300 pb-2" style={{ color: '#1A2F4B' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-justify leading-loose">{personal_info.summary}</p>
        </div>
      )}

      {/* Experience Section */}
      {experience?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-center border-b border-slate-300 pb-2" style={{ color: '#1A2F4B' }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <h3 className="font-bold text-base">{exp.position}</h3>
                  <p className="italic text-sm">{exp.company} {exp.location && `• ${exp.location}`}</p>
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {exp.start_date && format(new Date(exp.start_date), 'MMM yyyy')} - {
                    exp.current ? 'Present' : 
                    exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'
                  }
                </div>
              </div>
              {exp.achievements && (
                <ul className="mt-3 space-y-2">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm flex items-start">
                      <span className="mr-3 mt-1">•</span>
                      <span className="leading-relaxed">{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {education?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-center border-b border-slate-300 pb-2" style={{ color: '#1A2F4B' }}>
            EDUCATION
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <div className="font-bold">{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                  <div className="text-sm italic">{edu.institution}</div>
                  {edu.honors && <div className="text-sm font-medium">{edu.honors}</div>}
                </div>
                {edu.graduation_year && (
                  <div className="text-sm font-medium">{edu.graduation_year}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {skills?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-center border-b border-slate-300 pb-2" style={{ color: '#1A2F4B' }}>
            CORE COMPETENCIES
          </h2>
          <div className="text-sm leading-relaxed">
            {skills.join(' • ')}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 text-center border-b border-slate-300 pb-2" style={{ color: '#1A2F4B' }}>
            PROFESSIONAL CERTIFICATIONS
          </h2>
          <div className="space-y-2">
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
    </div>
  );
}