import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Trash2, Award, Target } from "lucide-react";

export default function SkillsForm({ skills, certifications, onSkillsChange, onCertificationsChange }) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      onSkillsChange([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    onSkillsChange(skills.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    const newCert = {
      name: '',
      issuer: '',
      date: ''
    };
    onCertificationsChange([...certifications, newCert]);
  };

  const updateCertification = (index, field, value) => {
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    onCertificationsChange(updated);
  };

  const removeCertification = (index) => {
    onCertificationsChange(certifications.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Core Skills & Competencies
          </h3>
          <p className="text-slate-600 mt-1">
            Add technical and leadership skills relevant to your target role.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="e.g., Strategic Planning, P&L Management"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {skills.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="text-center py-8">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No skills added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-800 px-3 py-1 text-sm hover:bg-blue-200 transition-colors"
              >
                {skill}
                <button
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Professional Certifications
            </h3>
            <p className="text-slate-600 mt-1">
              Add relevant certifications and professional credentials.
            </p>
          </div>
          <Button onClick={addCertification} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
        </div>

        {certifications.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="text-center py-8">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No certifications added yet</p>
              <p className="text-sm text-slate-400 mt-1">Optional, but can strengthen your profile</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-slate-900">Certification {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-semibold">Certification Name *</Label>
                      <Input
                        placeholder="PMP, CPA, Series 7"
                        value={cert.name || ''}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Issuing Organization</Label>
                      <Input
                        placeholder="PMI, AICPA, FINRA"
                        value={cert.issuer || ''}
                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Date Obtained</Label>
                      <Input
                        type="month"
                        value={cert.date || ''}
                        onChange={(e) => updateCertification(index, 'date', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}