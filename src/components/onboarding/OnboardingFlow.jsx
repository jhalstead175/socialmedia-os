import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { setRole } from "@/lib/role";

/**
 * Minimal 4-step onboarding flow
 * No wizard chrome, no progress bars - institutional authority
 */
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    resumeUploaded: false,
    resumeFile: null,
    role: null,
    seniority: null
  });

  // Step 1: Upload Resume
  if (!state.resumeUploaded) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-semibold mb-6">Upload Your Resume</h1>
          <p className="text-slate-300 mb-8">
            We'll analyze your current resume and optimize it for your target role.
          </p>

          <label className="block w-full border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-slate-600 cursor-pointer transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setState({ ...state, resumeUploaded: true, resumeFile: file });
                }
              }}
            />
            <div className="text-slate-400">
              <div className="text-4xl mb-3">📄</div>
              <div>Drop your resume here or click to browse</div>
              <div className="text-sm mt-2">PDF, DOCX up to 10MB</div>
            </div>
          </label>
        </div>
      </div>
    );
  }

  // Step 2: Select Role
  if (!state.role) {
    const roles = [
      { id: "executive", label: "Executive / Leadership", desc: "C-suite, VP, Director" },
      { id: "legal", label: "Legal / Professional", desc: "Attorney, CPA, Consultant" },
      { id: "tech", label: "Technology / Engineering", desc: "Engineer, Developer, PM" }
    ];

    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-semibold mb-6">Select Your Industry</h1>
          <p className="text-slate-300 mb-8">
            We'll tailor your resume tone and keywords to your field.
          </p>

          <div className="grid gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setRole(role.id);
                  setState({ ...state, role: role.id });
                }}
                className="border border-slate-700 rounded-xl p-6 text-left hover:border-slate-600 hover:bg-slate-900/50 transition-colors"
              >
                <div className="font-medium text-lg mb-1">{role.label}</div>
                <div className="text-slate-400 text-sm">{role.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Select Seniority
  if (!state.seniority) {
    const levels = [
      { id: "junior", label: "Entry Level", desc: "0-2 years experience" },
      { id: "mid", label: "Mid-Level", desc: "3-5 years experience" },
      { id: "senior", label: "Senior", desc: "6-10 years experience" },
      { id: "c-suite", label: "Executive", desc: "C-suite, VP, Director" }
    ];

    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-semibold mb-6">Experience Level</h1>
          <p className="text-slate-300 mb-8">
            This helps us calibrate your resume's tone and impact.
          </p>

          <div className="grid gap-4">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setState({ ...state, seniority: level.id })}
                className="border border-slate-700 rounded-xl p-6 text-left hover:border-slate-600 hover:bg-slate-900/50 transition-colors"
              >
                <div className="font-medium text-lg mb-1">{level.label}</div>
                <div className="text-slate-400 text-sm">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Generating
  setTimeout(() => {
    navigate(createPageUrl("Dashboard"));
  }, 2000);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">✨</div>
        <h1 className="text-3xl font-semibold mb-4">Analyzing Your Resume</h1>
        <p className="text-slate-300">
          Optimizing for {state.role} roles at {state.seniority} level...
        </p>
      </div>
    </div>
  );
}
