import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, Send } from 'lucide-react';
import { createStripePromo } from '@/api/functions';
import { Promo } from '@/api/entities';
import { toast } from 'sonner';

export default function PromoList({ promos, redemptionCounts, onEdit, onRefresh, isLoading }) {

  const handleCreateOnStripe = async (promoId) => {
    try {
      toast.info('Creating promo on Stripe...');
      await createStripePromo({ promo_id: promoId });
      toast.success('Promo successfully created/updated on Stripe!');
      onRefresh();
    } catch (error) {
      toast.error(`Stripe creation failed: ${error.message}`);
    }
  };

  const handleToggleEnabled = async (promo) => {
    try {
      await Promo.update(promo.id, { enabled: !promo.enabled });
      toast.success(`Promo ${!promo.enabled ? 'enabled' : 'disabled'}.`);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to toggle promo: ${error.message}`);
    }
  };

  const formatValue = (promo) => {
    if (promo.type === 'percent') return `${promo.value_number}%`;
    return `$${(promo.value_number / 100).toFixed(2)}`;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Plans</TableHead>
            <TableHead>Redemptions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan="7" className="text-center">Loading...</TableCell></TableRow>}
          {!isLoading && promos.map((promo) => (
            <TableRow key={promo.id}>
              <TableCell className="font-mono">{promo.code}</TableCell>
              <TableCell>{promo.label}</TableCell>
              <TableCell>{formatValue(promo)} ({promo.duration})</TableCell>
              <TableCell className="space-x-1">
                {promo.applies_to_plans.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
              </TableCell>
              <TableCell>{redemptionCounts[promo.id] || 0} / {promo.max_redemptions || '∞'}</TableCell>
              <TableCell>
                <Badge variant={promo.enabled ? 'success' : 'outline'}>{promo.enabled ? 'Enabled' : 'Disabled'}</Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleToggleEnabled(promo)}>
                  {promo.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCreateOnStripe(promo.id)} disabled={!promo.stripe_promotion_code_id}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(promo)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}