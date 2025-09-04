import React from "react";
import { format } from "date-fns";

export default function ConsultingEliteTemplate({ resume }) {
  const { personal_info, experience, education, skills, certifications } = resume;

  return (
    <div className="w-full h-[11in] bg-white text-slate-900 p-10 font-sans" style={{ fontSize: '9.5pt', lineHeight: '1.3' }}>
      {/* Modern Header with Accent */}
      <div className="mb-6 pb-4 relative">
        <div className="absolute left-0 top-0 w-1 h-16" style={{ backgroundColor: '#1E40AF' }}></div>
        <div className="pl-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#1E3A8A', fontFamily: 'sans-serif' }}>
            {personal_info?.full_name?.toUpperCase()}
          </h1>
          <div className="text-sm text-slate-600 flex flex-wrap gap-3">
            {personal_info?.email && <span>{personal_info.email}</span>}
            {personal_info?.phone && <span>|</span>}
            {personal_info?.phone && <span>{personal_info.phone}</span>}
            {personal_info?.location && <span>|</span>}
            {personal_info?.location && <span>{personal_info.location}</span>}
          </div>
          {personal_info?.linkedin && (
            <div className="text-sm text-slate-600">{personal_info.linkedin}</div>
          )}
        </div>
      </div>

      {/* Executive Summary with Metrics Focus */}
      {personal_info?.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center" style={{ color: '#1E40AF' }}>
            <span className="w-4 h-0.5 mr-2" style={{ backgroundColor: '#60A5FA' }}></span>
            Executive Summary
          </h2>
          <div className="pl-6">
            <p className="text-justify font-medium">{personal_info.summary}</p>
          </div>
        </div>
      )}

      {/* Professional Experience with Impact Focus */}
      {experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center" style={{ color: '#1E40AF' }}>
            <span className="w-4 h-0.5 mr-2" style={{ backgroundColor: '#60A5FA' }}></span>
            Professional Experience
          </h2>
          <div className="pl-6">
            {experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: '#1E3A8A' }}>{exp.position}</h3>
                    <p className="text-sm font-semibold">{exp.company}</p>
                    {exp.location && <p className="text-xs text-slate-500">{exp.location}</p>}
                  </div>
                  <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
                    {exp.start_date && format(new Date(exp.start_date), 'MMM yyyy')} - {
                      exp.current ? 'Present' : 
                      exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present'
                    }
                  </div>
                </div>
                {exp.achievements && (
                  <ul className="mt-2 space-y-1">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="text-sm flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-3 flex-shrink-0" 
                              style={{ backgroundColor: '#60A5FA' }}></span>
                        <span className="font-medium">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education with Academic Excellence Focus */}
      {education?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center" style={{ color: '#1E40AF' }}>
            <span className="w-4 h-0.5 mr-2" style={{ backgroundColor: '#60A5FA' }}></span>
            Education
          </h2>
          <div className="pl-6">
            {education.map((edu, index) => (
              <div key={index} className="mb-2 flex justify-between">
                <div>
                  <div className="font-bold text-sm">{edu.degree}{edu.field && ` • ${edu.field}`}</div>
                  <div className="text-sm font-semibold">{edu.institution}</div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    {edu.honors && <span>{edu.honors}</span>}
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
                {edu.graduation_year && (
                  <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                    {edu.graduation_year}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Certifications in Columns */}
      <div className="grid grid-cols-2 gap-8">
        {/* Core Competencies */}
        {skills?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center" style={{ color: '#1E40AF' }}>
              <span className="w-4 h-0.5 mr-2" style={{ backgroundColor: '#60A5FA' }}></span>
              Core Competencies
            </h2>
            <div className="pl-6">
              <div className="grid grid-cols-1 gap-1">
                {skills.map((skill, index) => (
                  <div key={index} className="text-sm flex items-center">
                    <span className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#60A5FA' }}></span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Professional Certifications */}
        {certifications?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center" style={{ color: '#1E40AF' }}>
              <span className="w-4 h-0.5 mr-2" style={{ backgroundColor: '#60A5FA' }}></span>
              Certifications
            </h2>
            <div className="pl-6">
              {certifications.map((cert, index) => (
                <div key={index} className="mb-2 text-sm">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-xs text-slate-600">
                    {cert.issuer}{cert.date && ` • ${format(new Date(cert.date), 'MMM yyyy')}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}