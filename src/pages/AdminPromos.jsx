
import React, { useState, useEffect, useCallback } from 'react';
import { Promo, PromoRedemption } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PromoForm from '../components/admin/PromoForm';
import PromoList from '../components/admin/PromoList';
import PromoBannerAdmin from '../components/admin/PromoBannerAdmin'; // Added import

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [redemptionCounts, setRedemptionCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchPromos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [promoData, redemptionData] = await Promise.all([
        Promo.list('-created_date'),
        PromoRedemption.list()
      ]);
      setPromos(promoData);

      const counts = redemptionData.reduce((acc, r) => {
        acc[r.promo_id] = (acc[r.promo_id] || 0) + 1;
        return acc;
      }, {});
      setRedemptionCounts(counts);

    } catch (error) {
      console.error("Failed to fetch promos:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPromo(null);
    setIsFormOpen(true);
  };

  const onFormSubmit = () => {
    setIsFormOpen(false);
    fetchPromos();
  };

  return (
    <div className="space-y-8">
      {/* Promo Codes Management Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Promo Codes</CardTitle>
            <CardDescription>
              Create, edit, and manage discount codes for marketing campaigns.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchPromos} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPromo ? 'Edit' : 'Create'} Promo Code</DialogTitle>
                </DialogHeader>
                <PromoForm promo={editingPromo} onSubmit={onFormSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <PromoList 
            promos={promos} 
            redemptionCounts={redemptionCounts} 
            onEdit={handleEdit} 
            onRefresh={fetchPromos} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>

      {/* Promo Banners Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Promo Banners</CardTitle>
          <CardDescription>
            Control the top-of-page banners that promote codes on different pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromoBannerAdmin />
        </CardContent>
      </Card>
    </div>
  );
}
