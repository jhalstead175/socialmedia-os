
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Briefcase } from "lucide-react";
// PRODUCTION FIX: Removed @hello-pangea/dnd dependency
// Drag-and-drop reordering disabled for launch (users can still add/edit/delete)

export default function ExperienceForm({ experiences, onChange }) {
  const addExperience = () => {
    const newExperience = {
      // Assign a unique ID for better D&D keying, if not already present in the data structure
      id: Date.now().toString(), 
      company: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      achievements: ['']
    };
    onChange([...experiences, newExperience]);
  };

  const updateExperience = (index, field, value) => {
    const updated = experiences.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange(updated);
  };

  const removeExperience = (index) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const addAchievement = (expIndex) => {
    const updated = experiences.map((exp, i) => 
      i === expIndex 
        ? { ...exp, achievements: [...exp.achievements, ''] }
        : exp
    );
    onChange(updated);
  };

  const updateAchievement = (expIndex, achievementIndex, value) => {
    const updated = experiences.map((exp, i) => {
      if (i === expIndex) {
        const newAchievements = exp.achievements.map((ach, j) => 
          j === achievementIndex ? value : ach
        );
        return { ...exp, achievements: newAchievements };
      }
      return exp;
    });
    onChange(updated);
  };

  const removeAchievement = (expIndex, achievementIndex) => {
    const updated = experiences.map((exp, i) => {
      if (i === expIndex) {
        return { 
          ...exp, 
          achievements: exp.achievements.filter((_, j) => j !== achievementIndex)
        };
      }
      return exp;
    });
    onChange(updated);
  };

  // PRODUCTION FIX: Drag-and-drop disabled
  // const handleOnDragEnd = (result) => {
  //   if (!result.destination) return;
  //   const items = Array.from(experiences);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
  //   onChange(items);
  // };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Professional Experience</h3>
          <p className="text-slate-600 mt-1">
            Add your work history with quantifiable achievements.
          </p>
        </div>
        <Button onClick={addExperience} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No experience added yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "Add Position" to start</p>
          </CardContent>
        </Card>
      ) : (
        // PRODUCTION FIX: Removed drag-and-drop wrapper components
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <Card
              key={exp.id || index}
              className="border-slate-200"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {/* PRODUCTION FIX: Drag handle removed */}
                    <h4 className="font-semibold text-slate-900">Position {index + 1}</h4>
                  </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExperience(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-semibold">Company *</Label>
                              <Input
                                placeholder="Apple Inc."
                                value={exp.company || ''}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Position *</Label>
                              <Input
                                placeholder="Chief Executive Officer"
                                value={exp.position || ''}
                                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-semibold">Location</Label>
                              <Input
                                placeholder="Cupertino, CA"
                                value={exp.location || ''}
                                onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Start Date *</Label>
                              <Input
                                type="month"
                                value={exp.start_date || ''}
                                onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">End Date</Label>
                              <Input
                                type="month"
                                value={exp.end_date || ''}
                                onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                                className="mt-1"
                                disabled={exp.current}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                              id={`current-${index}`}
                              checked={exp.current || false}
                              onCheckedChange={(checked) => updateExperience(index, 'current', checked)}
                            />
                            <Label htmlFor={`current-${index}`} className="text-sm">
                              I currently work here
                            </Label>
                          </div>

                          <div>
                            <Label className="text-sm font-semibold">Key Achievements *</Label>
                            <p className="text-xs text-slate-500 mb-2">
                              Use action verbs and quantify results (e.g., "Increased revenue by 45%")
                            </p>
                            
                            <div className="space-y-2">
                              {(exp.achievements || ['']).map((achievement, achIndex) => (
                                <div key={achIndex} className="flex gap-2">
                                  <Textarea
                                    placeholder={`• ${achIndex === 0 ? 'Led cross-functional team of 50+ employees to deliver $10M+ project ahead of schedule' : 'Describe another key achievement with quantifiable results'}`}
                                    value={achievement}
                                    onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                                    className="flex-1 h-20 resize-none"
                                  />
                                  {exp.achievements.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeAchievement(index, achIndex)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addAchievement(index)}
                                className="w-full border-dashed"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Achievement
                              </Button>
                            </div>
                          </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
