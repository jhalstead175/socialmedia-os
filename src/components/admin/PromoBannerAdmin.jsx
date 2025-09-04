import React, { useState, useEffect } from 'react';
import { PromoBanner, Promo } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Plus, 
    Settings, 
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function PromoBannerAdmin() {
    const [banners, setBanners] = useState([]);
    const [promos, setPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    
    const [formData, setFormData] = useState({
        promo_code: '',
        headline: '',
        subcopy: '',
        cta_text: 'Apply Code',
        surface: [],
        start_at: '',
        end_at: '',
        enabled: true,
        theme: 'gradient',
        scroll_to: 'pricing',
        dismiss_ttl_days: 14
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bannersData, promosData] = await Promise.all([
                PromoBanner.list('-created_date'),
                Promo.filter({ enabled: true })
            ]);
            setBanners(bannersData);
            setPromos(promosData);
        } catch (error) {
            console.error('Failed to fetch promo banners:', error);
            toast.error('Failed to load promo banners');
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.promo_code || !formData.headline || !formData.cta_text) {
            toast.error('Promo code, headline, and CTA text are required');
            return;
        }

        if (formData.surface.length === 0) {
            toast.error('At least one surface must be selected');
            return;
        }

        try {
            const bannerData = {
                ...formData,
                start_at: formData.start_at || null,
                end_at: formData.end_at || null
            };

            if (editingBanner) {
                await PromoBanner.update(editingBanner.id, bannerData);
                toast.success('Promo banner updated');
            } else {
                await PromoBanner.create(bannerData);
                toast.success('Promo banner created');
            }

            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to save promo banner:', error);
            toast.error('Failed to save promo banner');
        }
    };

    const resetForm = () => {
        setFormData({
            promo_code: '',
            headline: '',
            subcopy: '',
            cta_text: 'Apply Code',
            surface: [],
            start_at: '',
            end_at: '',
            enabled: true,
            theme: 'gradient',
            scroll_to: 'pricing',
            dismiss_ttl_days: 14
        });
        setShowForm(false);
        setEditingBanner(null);
    };

    const handleEdit = (banner) => {
        setFormData({
            promo_code: banner.promo_code || '',
            headline: banner.headline || '',
            subcopy: banner.subcopy || '',
            cta_text: banner.cta_text || 'Apply Code',
            surface: banner.surface || [],
            start_at: banner.start_at || '',
            end_at: banner.end_at || '',
            enabled: banner.enabled ?? true,
            theme: banner.theme || 'gradient',
            scroll_to: banner.scroll_to || 'pricing',
            dismiss_ttl_days: banner.dismiss_ttl_days || 14
        });
        setEditingBanner(banner);
        setShowForm(true);
    };

    const toggleEnabled = async (bannerId, currentState) => {
        try {
            await PromoBanner.update(bannerId, { enabled: !currentState });
            toast.success(currentState ? 'Banner disabled' : 'Banner enabled');
            fetchData();
        } catch (error) {
            toast.error('Failed to update banner status');
        }
    };

    const handleSurfaceChange = (surface, checked) => {
        if (checked) {
            setFormData({...formData, surface: [...formData.surface, surface]});
        } else {
            setFormData({...formData, surface: formData.surface.filter(s => s !== surface)});
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Promo Banners</h3>
                    <p className="text-sm text-slate-600">Manage top-of-page promotional banners</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Banner
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingBanner ? 'Edit' : 'Create'} Promo Banner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="promo_code">Promo Code*</Label>
                                    <Select 
                                        value={formData.promo_code} 
                                        onValueChange={(value) => setFormData({...formData, promo_code: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select promo code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {promos.map(promo => (
                                                <SelectItem key={promo.id} value={promo.code}>
                                                    {promo.code} - {promo.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="theme">Theme</Label>
                                    <Select 
                                        value={formData.theme} 
                                        onValueChange={(value) => setFormData({...formData, theme: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gradient">Gradient</SelectItem>
                                            <SelectItem value="solid-dark">Solid Dark</SelectItem>
                                            <SelectItem value="solid-indigo">Solid Indigo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="headline">Headline*</Label>
                                    <Input
                                        id="headline"
                                        value={formData.headline}
                                        onChange={(e) => setFormData({...formData, headline: e.target.value})}
                                        placeholder="e.g., Save 30% on Pro Annual"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="subcopy">Subcopy</Label>
                                    <Input
                                        id="subcopy"
                                        value={formData.subcopy}
                                        onChange={(e) => setFormData({...formData, subcopy: e.target.value})}
                                        placeholder="e.g., Use code WELCOME30 at checkout"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cta_text">CTA Text*</Label>
                                    <Input
                                        id="cta_text"
                                        value={formData.cta_text}
                                        onChange={(e) => setFormData({...formData, cta_text: e.target.value})}
                                        placeholder="Apply Code"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="scroll_to">Scroll To</Label>
                                    <Select 
                                        value={formData.scroll_to} 
                                        onValueChange={(value) => setFormData({...formData, scroll_to: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pricing">Pricing Section</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Surfaces*</Label>
                                <div className="flex gap-4 mt-2">
                                    {['home', 'pricing'].map(surface => (
                                        <div key={surface} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={surface}
                                                checked={formData.surface.includes(surface)}
                                                onCheckedChange={(checked) => handleSurfaceChange(surface, checked)}
                                            />
                                            <Label htmlFor={surface} className="capitalize">{surface}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="start_at">Start Date (Optional)</Label>
                                    <Input
                                        id="start_at"
                                        type="datetime-local"
                                        value={formData.start_at}
                                        onChange={(e) => setFormData({...formData, start_at: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="end_at">End Date (Optional)</Label>
                                    <Input
                                        id="end_at"
                                        type="datetime-local"
                                        value={formData.end_at}
                                        onChange={(e) => setFormData({...formData, end_at: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="dismiss_ttl_days">Dismiss TTL (Days)</Label>
                                    <Input
                                        id="dismiss_ttl_days"
                                        type="number"
                                        value={formData.dismiss_ttl_days}
                                        onChange={(e) => setFormData({...formData, dismiss_ttl_days: parseInt(e.target.value) || 14})}
                                        min="1"
                                        max="365"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="enabled"
                                    checked={formData.enabled}
                                    onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
                                />
                                <Label htmlFor="enabled">Enabled</Label>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingBanner ? 'Update' : 'Create'} Banner
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Headline</TableHead>
                                    <TableHead>Promo Code</TableHead>
                                    <TableHead>Surfaces</TableHead>
                                    <TableHead>Theme</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.map(banner => (
                                    <TableRow key={banner.id}>
                                        <TableCell className="font-medium">
                                            {banner.headline}
                                            {banner.subcopy && (
                                                <div className="text-xs text-slate-500 mt-1">{banner.subcopy}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{banner.promo_code}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {banner.surface.map(surface => (
                                                    <Badge key={surface} variant="outline" className="text-xs">
                                                        {surface}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {banner.theme}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={banner.enabled ? 'default' : 'secondary'}>
                                                {banner.enabled ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleEdit(banner)}
                                                >
                                                    <Settings className="w-3 h-3" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => toggleEnabled(banner.id, banner.enabled)}
                                                >
                                                    {banner.enabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {banners.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                            No promo banners created yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}