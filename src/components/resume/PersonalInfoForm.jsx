
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function PersonalInfoForm({ data, onChange, errors = {} }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h3>
        <p className="text-slate-600 mb-6">
          Provide your contact details and professional summary.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name" className="text-sm font-semibold">Full Name *</Label>
          <Input
            id="full_name"
            placeholder="John Smith"
            value={data.full_name || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            className={`mt-1 ${errors.full_name ? 'border-red-500' : ''}`}
          />
          {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
          <Input
            id="location"
            placeholder="New York, NY"
            value={data.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedin" className="text-sm font-semibold">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            placeholder="linkedin.com/in/johnsmith"
            value={data.linkedin || ''}
            onChange={(e) => onChange('linkedin', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="website" className="text-sm font-semibold">Website/Portfolio</Label>
          <Input
            id="website"
            placeholder="www.johnsmith.com"
            value={data.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="summary" className="text-sm font-semibold">Professional Summary *</Label>
        <Textarea
          id="summary"
          placeholder="Dynamic executive with 15+ years of experience leading high-growth organizations..."
          value={data.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          className={`mt-1 h-32 resize-none ${errors.summary ? 'border-red-500' : ''}`}
        />
        {errors.summary && <p className="text-xs text-red-600 mt-1">{errors.summary}</p>}
        <p className="text-xs text-slate-500 mt-1">
          2-3 sentences highlighting your leadership experience and key achievements
        </p>
      </div>
    </div>
  );
}
