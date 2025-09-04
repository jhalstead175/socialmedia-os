import React, { useState } from 'react';
import { Promo } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function PromoForm({ promo, onSubmit }) {
  const [formData, setFormData] = useState(promo || {
    code: '',
    label: '',
    type: 'percent',
    value_number: 10,
    duration: 'once',
    duration_in_months: null,
    applies_to_plans: ['pro', 'elite'],
    applies_to_billing: ['monthly', 'annual'],
    trial_extension_days: 0,
    starts_at: null,
    ends_at: null,
    max_redemptions: null,
    per_user_limit: 1,
    new_customers_only: false,
    enabled: true,
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    const current = formData[field] || [];
    const newArray = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    handleChange(field, newArray);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, code: formData.code.toUpperCase() };
      if (promo?.id) {
        await Promo.update(promo.id, payload);
        toast.success('Promo updated successfully!');
      } else {
        await Promo.create(payload);
        toast.success('Promo created successfully!');
      }
      onSubmit();
    } catch (error) {
      toast.error(`Save failed: ${error.message}`);
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" value={formData.code} onChange={e => handleChange('code', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" value={formData.label} onChange={e => handleChange('label', e.target.value)} required />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{formData.type === 'percent' ? 'Percentage Off' : 'Amount (in cents)'}</Label>
          <Input type="number" value={formData.value_number} onChange={e => handleChange('value_number', parseInt(e.target.value))} />
        </div>
        <div>
          <Label>Duration</Label>
          <Select value={formData.duration} onValueChange={v => handleChange('duration', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Once</SelectItem>
              <SelectItem value="repeating">Repeating</SelectItem>
              <SelectItem value="forever">Forever</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.duration === 'repeating' && (
        <div>
          <Label>Duration in Months</Label>
          <Input type="number" value={formData.duration_in_months} onChange={e => handleChange('duration_in_months', parseInt(e.target.value))} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Applicable Plans</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2"><Checkbox checked={formData.applies_to_plans.includes('pro')} onCheckedChange={() => handleArrayChange('applies_to_plans', 'pro')} /> Pro</div>
            <div className="flex items-center gap-2"><Checkbox checked={formData.applies_to_plans.includes('elite')} onCheckedChange={() => handleArrayChange('applies_to_plans', 'elite')} /> Elite</div>
          </div>
        </div>
        <div>
          <Label>Applicable Billing</Label>
           <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2"><Checkbox checked={formData.applies_to_billing.includes('monthly')} onCheckedChange={() => handleArrayChange('applies_to_billing', 'monthly')} /> Monthly</div>
            <div className="flex items-center gap-2"><Checkbox checked={formData.applies_to_billing.includes('annual')} onCheckedChange={() => handleArrayChange('applies_to_billing', 'annual')} /> Annual</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input type="datetime-local" value={formData.starts_at ? formData.starts_at.slice(0, 16) : ''} onChange={e => handleChange('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="datetime-local" value={formData.ends_at ? formData.ends_at.slice(0, 16) : ''} onChange={e => handleChange('ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
          <Label>Max Redemptions</Label>
          <Input type="number" placeholder="Unlimited" value={formData.max_redemptions} onChange={e => handleChange('max_redemptions', e.target.value ? parseInt(e.target.value) : null)} />
        </div>
        <div>
          <Label>Per-User Limit</Label>
          <Input type="number" value={formData.per_user_limit} onChange={e => handleChange('per_user_limit', parseInt(e.target.value))} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><Checkbox checked={formData.new_customers_only} onCheckedChange={v => handleChange('new_customers_only', v)} /> New Customers Only</div>
        <div className="flex items-center gap-2"><Checkbox checked={formData.enabled} onCheckedChange={v => handleChange('enabled', v)} /> Enabled</div>
      </div>

       <div>
          <Label>Notes</Label>
          <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} />
        </div>
      
      <div className="text-right">
        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Promo'}</Button>
      </div>
    </form>
  );
}