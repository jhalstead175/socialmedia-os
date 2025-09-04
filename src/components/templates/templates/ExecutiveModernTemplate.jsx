import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ExecutiveModernTemplate({ resume }) {
  const { personal_info, experience, education, skills, certifications } = resume;

  return (
    <div className="w-full h-[11in] bg-white text-slate-900 p-12 font-sans unscale-on-print" style={{ fontSize: '10pt', lineHeight: '1.4' }}>
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b-2" style={{ borderColor: '#1A2F4B' }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A2F4B', fontFamily: 'Montserrat, sans-serif' }}>
          {personal_info?.full_name?.toUpperCase()}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {personal_info?.email && <span>{personal_info.email}</span>}
          {personal_info?.phone && <span>{personal_info.phone}</span>}
          {personal_info?.location && <span>{personal_info.location}</span>}
          {personal_info?.linkedin && <span>{personal_info.linkedin}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {personal_info?.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: '#B88B4A', fontFamily: 'Montserrat, sans-serif' }}>
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-justify leading-relaxed">{personal_info.summary}</p>
        </div>
      )}

      {/* Experience Section */}
      {experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#B88B4A', fontFamily: 'Montserrat, sans-serif' }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-base" style={{ color: '#1A2F4B' }}>{exp.position}</h3>
                  <p className="font-semibold text-sm">{exp.company} {exp.location && `• ${exp.location}`}</p>
                </div>
                <div className="text-sm text-slate-600">
                  {exp.start_date && format(new Date(exp.start_date), 'MMM yyyy')} - {
                    exp.current ? 'Present' : 
                    exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'
                  }
                </div>
              </div>
              {exp.achievements && (
                <ul className="mt-2 space-y-1">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm flex">
                      <span className="mr-2" style={{ color: '#B88B4A' }}>•</span>
                      <span>{achievement}</span>
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
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: '#B88B4A', fontFamily: 'Montserrat, sans-serif' }}>
            EDUCATION
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  {edu.field && <span> in {edu.field}</span>}
                  <div className="text-sm font-semibold">{edu.institution}</div>
                  {edu.honors && <div className="text-sm italic">{edu.honors}</div>}
                </div>
                {edu.graduation_year && (
                  <div className="text-sm text-slate-600">{edu.graduation_year}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {skills?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: '#B88B4A', fontFamily: 'Montserrat, sans-serif' }}>
            CORE COMPETENCIES
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 text-xs font-medium rounded-full border" 
                    style={{ borderColor: '#B88B4A', color: '#1A2F4B' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#B88B4A', fontFamily: 'Montserrat, sans-serif' }}>
            PROFESSIONAL CERTIFICATIONS
          </h2>
          {certifications.map((cert, index) => (
            <div key={index} className="mb-1">
              <span className="font-semibold">{cert.name}</span>
              {cert.issuer && <span className="text-sm text-slate-600"> - {cert.issuer}</span>}
              {cert.date && <span className="text-sm text-slate-600"> ({format(new Date(cert.date), 'yyyy')})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}