import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GraduationCap } from "lucide-react";

export default function EducationForm({ education, onChange }) {
  const addEducation = () => {
    const newEducation = {
      institution: '',
      degree: '',
      field: '',
      graduation_year: '',
      gpa: '',
      honors: ''
    };
    onChange([...education, newEducation]);
  };

  const updateEducation = (index, field, value) => {
    const updated = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    onChange(updated);
  };

  const removeEducation = (index) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Education</h3>
          <p className="text-slate-600 mt-1">
            Add your educational background and achievements.
          </p>
        </div>
        <Button onClick={addEducation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No education added yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "Add Education" to start</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {education.map((edu, index) => (
            <Card key={index} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-slate-900">Education {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-semibold">Institution *</Label>
                    <Input
                      placeholder="Harvard University"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Degree *</Label>
                    <Input
                      placeholder="MBA, JD, Bachelor of Science"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-semibold">Field of Study</Label>
                    <Input
                      placeholder="Business Administration"
                      value={edu.field || ''}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Graduation Year</Label>
                    <Input
                      type="number"
                      min="1950"
                      max="2030"
                      placeholder="2018"
                      value={edu.graduation_year || ''}
                      onChange={(e) => updateEducation(index, 'graduation_year', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">GPA (Optional)</Label>
                    <Input
                      placeholder="3.8/4.0"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Honors & Achievements</Label>
                  <Input
                    placeholder="Magna Cum Laude, Dean's List, Phi Beta Kappa"
                    value={edu.honors || ''}
                    onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}