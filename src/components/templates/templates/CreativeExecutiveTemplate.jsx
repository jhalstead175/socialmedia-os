import React from "react";
import { format } from "date-fns";

export default function CreativeExecutiveTemplate({ resume }) {
  const { personal_info, experience, education, skills, certifications } = resume;

  return (
    <div className="w-full h-[11in] bg-white text-slate-900 p-8 font-sans relative" style={{ fontSize: '9pt', lineHeight: '1.4' }}>
      
      {/* Creative Color Accent Bar */}
      <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-purple-500 via-blue-500 to-green-500"></div>
      
      <div className="pl-8">
        {/* Dynamic Header */}
        <div className="mb-6 pb-4 relative">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'sans-serif', fontWeight: '800' }}>
            {personal_info?.full_name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              {personal_info?.email}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {personal_info?.phone}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {personal_info?.location}
            </div>
          </div>
          {personal_info?.linkedin && (
            <div className="text-sm text-slate-600 mt-1">{personal_info.linkedin}</div>
          )}
        </div>

        {/* Creative Summary with Gradient Background */}
        {personal_info?.summary && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)' }}>
            <h2 className="text-sm font-bold mb-2 uppercase tracking-wider text-purple-700">
              Creative Vision
            </h2>
            <p className="text-justify font-medium italic">{personal_info.summary}</p>
          </div>
        )}

        {/* Experience with Creative Styling */}
        {experience?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wider text-purple-700 flex items-center">
              <span className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 mr-3"></span>
              Professional Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={index} className="mb-4 relative">
                <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-purple-300 to-blue-300"></div>
                <div className="pl-6">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{exp.position}</h3>
                      <p className="text-sm font-semibold text-purple-600">{exp.company}</p>
                      {exp.location && <p className="text-xs text-slate-500">{exp.location}</p>}
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
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
                          <span className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0 bg-gradient-to-r from-purple-400 to-blue-400"></span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education with Modern Card Design */}
        {education?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wider text-purple-700 flex items-center">
              <span className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 mr-3"></span>
              Education
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {education.map((edu, index) => (
                <div key={index} className="p-3 rounded-lg border-l-4 border-blue-400" 
                     style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold text-sm">{edu.degree}</div>
                      {edu.field && <div className="text-sm text-blue-600">{edu.field}</div>}
                      <div className="text-sm font-semibold">{edu.institution}</div>
                      {edu.honors && <div className="text-xs italic text-green-600">{edu.honors}</div>}
                    </div>
                    {edu.graduation_year && (
                      <div className="text-xs px-2 py-1 rounded bg-gradient-to-r from-blue-100 to-green-100 text-blue-700">
                        {edu.graduation_year}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Certifications with Creative Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Skills with Tag Cloud Style */}
          {skills?.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-3 uppercase tracking-wider text-purple-700 flex items-center">
                <span className="w-6 h-0.5 bg-gradient-to-r from-green-500 to-purple-500 mr-3"></span>
                Creative Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => {
                  const colors = [
                    'from-purple-400 to-pink-400',
                    'from-blue-400 to-cyan-400',
                    'from-green-400 to-emerald-400',
                    'from-yellow-400 to-orange-400',
                    'from-red-400 to-pink-400'
                  ];
                  const colorClass = colors[index % colors.length];
                  return (
                    <span key={index} 
                          className={`px-3 py-1 text-xs font-medium rounded-full text-white bg-gradient-to-r ${colorClass} shadow-sm`}>
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications?.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-3 uppercase tracking-wider text-purple-700 flex items-center">
                <span className="w-6 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 mr-3"></span>
                Certifications
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} className="mb-2 p-2 rounded border-l-2 border-pink-400" 
                     style={{ backgroundColor: '#FDF2F8' }}>
                  <div className="font-semibold text-sm">{cert.name}</div>
                  <div className="text-xs text-slate-600">
                    {cert.issuer}{cert.date && ` • ${format(new Date(cert.date), 'MMM yyyy')}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}