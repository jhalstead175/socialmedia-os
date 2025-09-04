import React from "react";
import { format } from "date-fns";

export default function FinanceExecutiveTemplate({ resume }) {
  const { personal_info, experience, education, skills, certifications } = resume;

  return (
    <div className="w-full h-[11in] bg-white text-slate-900 p-10 font-sans" style={{ fontSize: '9.5pt', lineHeight: '1.35' }}>
      {/* Professional Header with Financial Styling */}
      <div className="mb-6 pb-4 border-b-2" style={{ borderColor: '#1A2F4B' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A2F4B', fontFamily: 'serif' }}>
            {personal_info?.full_name}
          </h1>
          <div className="text-sm text-slate-600 space-x-2">
            {personal_info?.email && <span className="font-medium">{personal_info.email}</span>}
            {personal_info?.phone && <span>•</span>}
            {personal_info?.phone && <span>{personal_info.phone}</span>}
            {personal_info?.location && <span>•</span>}
            {personal_info?.location && <span>{personal_info.location}</span>}
          </div>
          {personal_info?.linkedin && (
            <div className="text-sm text-slate-600 mt-1">{personal_info.linkedin}</div>
          )}
        </div>
      </div>

      {/* Executive Profile */}
      {personal_info?.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 text-center uppercase tracking-wider pb-2" 
              style={{ color: '#B88B4A', borderBottom: '1px solid #E5E7EB' }}>
            Executive Profile
          </h2>
          <p className="text-center text-sm leading-relaxed font-medium px-8">{personal_info.summary}</p>
        </div>
      )}

      {/* Professional Experience - Finance Focused */}
      {experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 text-center uppercase tracking-wider pb-2" 
              style={{ color: '#B88B4A', borderBottom: '1px solid #E5E7EB' }}>
            Professional Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4 px-4">
              <div className="text-center mb-2">
                <h3 className="font-bold text-base" style={{ color: '#1A2F4B' }}>{exp.position}</h3>
                <p className="text-sm font-semibold italic">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                <p className="text-xs" style={{ color: '#B88B4A' }}>
                  {exp.start_date && format(new Date(exp.start_date), 'MMMM yyyy')} - {
                    exp.current ? 'Present' : 
                    exp.end_date ? format(new Date(exp.end_date), 'MMMM yyyy') : 'Present'
                  }
                </p>
              </div>
              {exp.achievements && (
                <div className="mt-3">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="text-sm mb-1 px-2 text-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 mt-1" 
                            style={{ backgroundColor: '#B88B4A' }}></span>
                      {achievement}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education & Credentials Side by Side */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Education */}
        {education?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 text-center uppercase tracking-wider pb-2" 
                style={{ color: '#B88B4A', borderBottom: '1px solid #E5E7EB' }}>
              Education
            </h2>
            {education.map((edu, index) => (
              <div key={index} className="mb-3 text-center">
                <div className="font-bold text-sm">{edu.degree}</div>
                {edu.field && <div className="text-sm">{edu.field}</div>}
                <div className="text-sm font-semibold italic">{edu.institution}</div>
                {edu.graduation_year && (
                  <div className="text-xs" style={{ color: '#B88B4A' }}>{edu.graduation_year}</div>
                )}
                {edu.honors && <div className="text-xs font-medium">{edu.honors}</div>}
                {edu.gpa && parseFloat(edu.gpa) >= 3.5 && (
                  <div className="text-xs">GPA: {edu.gpa}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 text-center uppercase tracking-wider pb-2" 
                style={{ color: '#B88B4A', borderBottom: '1px solid #E5E7EB' }}>
              Certifications
            </h2>
            {certifications.map((cert, index) => (
              <div key={index} className="mb-3 text-center">
                <div className="font-bold text-sm">{cert.name}</div>
                {cert.issuer && <div className="text-sm italic">{cert.issuer}</div>}
                {cert.date && (
                  <div className="text-xs" style={{ color: '#B88B4A' }}>
                    {format(new Date(cert.date), 'MMMM yyyy')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Core Competencies */}
      {skills?.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3 text-center uppercase tracking-wider pb-2" 
              style={{ color: '#B88B4A', borderBottom: '1px solid #E5E7EB' }}>
            Core Competencies
          </h2>
          <div className="grid grid-cols-3 gap-2 px-8">
            {skills.map((skill, index) => (
              <div key={index} className="text-center text-sm py-1 px-2 rounded" 
                   style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}