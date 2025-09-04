import React, { useState, useEffect } from 'react';
import { CampaignLink, Promo } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Plus, 
    Copy, 
    ExternalLink, 
    BarChart3, 
    Settings,
    Trash2,
    Eye,
    EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCampaignLinks() {
    const [campaignLinks, setCampaignLinks] = useState([]);
    const [promos, setPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        promo_code: '',
        landing_path: '/',
        plan: '',
        billing: '',
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: ''
    });

    const appUrl = window.location.origin;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [linksData, promosData] = await Promise.all([
                CampaignLink.list('-created_date'),
                Promo.filter({ enabled: true })
            ]);
            setCampaignLinks(linksData);
            setPromos(promosData);
        } catch (error) {
            console.error('Failed to fetch campaign links:', error);
            toast.error('Failed to load campaign links');
        }
        setIsLoading(false);
    };

    const generateSlug = (name) => {
        const prefix = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 3) || 'lnk';
        const suffix = Math.random().toString(36).substring(2, 6);
        return `${prefix}-${suffix}`;
    };

    const buildPreviewUrl = (campaign) => {
        let url = appUrl + campaign.landing_path;
        const params = new URLSearchParams();

        if (campaign.promo_code) params.append('promo', campaign.promo_code);
        if (campaign.landing_path === '/checkout') {
            params.append('plan', campaign.plan || 'pro');
            params.append('billing', campaign.billing || 'annual');
        }
        
        params.append('utm_source', campaign.utm_source || 'campaign');
        params.append('utm_medium', campaign.utm_medium || 'social');
        params.append('utm_campaign', campaign.utm_campaign || campaign.slug);
        if (campaign.utm_content) params.append('utm_content', campaign.utm_content);

        return params.toString() ? `${url}?${params.toString()}` : url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Campaign name is required');
            return;
        }

        try {
            const slug = editingLink ? editingLink.slug : generateSlug(formData.name);
            const campaignData = {
                ...formData,
                slug,
                utm_source: formData.utm_source || 'campaign',
                utm_medium: formData.utm_medium || 'social',
                utm_campaign: formData.utm_campaign || slug
            };

            if (editingLink) {
                await CampaignLink.update(editingLink.id, campaignData);
                toast.success('Campaign link updated');
            } else {
                await CampaignLink.create(campaignData);
                toast.success('Campaign link created');
            }

            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to save campaign link:', error);
            toast.error('Failed to save campaign link');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            promo_code: '',
            landing_path: '/',
            plan: '',
            billing: '',
            utm_source: '',
            utm_medium: '',
            utm_campaign: '',
            utm_content: ''
        });
        setShowForm(false);
        setEditingLink(null);
    };

    const handleEdit = (link) => {
        setFormData({
            name: link.name || '',
            promo_code: link.promo_code || '',
            landing_path: link.landing_path || '/',
            plan: link.plan || '',
            billing: link.billing || '',
            utm_source: link.utm_source || '',
            utm_medium: link.utm_medium || '',
            utm_campaign: link.utm_campaign || '',
            utm_content: link.utm_content || ''
        });
        setEditingLink(link);
        setShowForm(true);
    };

    const toggleActive = async (linkId, currentState) => {
        try {
            await CampaignLink.update(linkId, { is_active: !currentState });
            toast.success(currentState ? 'Campaign link disabled' : 'Campaign link enabled');
            fetchData();
        } catch (error) {
            toast.error('Failed to update campaign link status');
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const getSocialCopy = (shortLink) => ({
        twitter: `Save more, apply faster. I'm using Rezemai to tailor resumes and prep interviews. ${shortLink}`,
        linkedin: `If you're job hunting, Rezemai helps you tailor your resume to each JD and prep for interviews in minutes. Grab this offer: ${shortLink}`,
        email: `Hey—sharing a tool I like for resumes/interviews: Rezemai. Here's a link with the current promo: ${shortLink}`
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Campaign Links</h2>
                    <p className="text-slate-600">Create trackable marketing links with UTM parameters</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign Link
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingLink ? 'Edit' : 'Create'} Campaign Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Campaign Name*</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g., Fall Launch IG Story"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="promo_code">Promo Code</Label>
                                    <Select onValueChange={(value) => setFormData({...formData, promo_code: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select promo code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>None</SelectItem>
                                            {promos.map(promo => (
                                                <SelectItem key={promo.id} value={promo.code}>
                                                    {promo.code} - {promo.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="landing_path">Landing Path*</Label>
                                    <Select 
                                        value={formData.landing_path} 
                                        onValueChange={(value) => setFormData({...formData, landing_path: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select landing path" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="/">Homepage</SelectItem>
                                            <SelectItem value="/#pricing">Pricing Section</SelectItem>
                                            <SelectItem value="/checkout">Checkout</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.landing_path === '/checkout' && (
                                    <>
                                        <div>
                                            <Label htmlFor="plan">Plan</Label>
                                            <Select 
                                                value={formData.plan} 
                                                onValueChange={(value) => setFormData({...formData, plan: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select plan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pro">Pro (default)</SelectItem>
                                                    <SelectItem value="elite">Elite</SelectItem>
                                                    <SelectItem value="starter">Starter</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="billing">Billing</Label>
                                            <Select 
                                                value={formData.billing} 
                                                onValueChange={(value) => setFormData({...formData, billing: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select billing" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="annual">Annual (default)</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">UTM Parameters</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="utm_source">UTM Source</Label>
                                        <Input
                                            id="utm_source"
                                            value={formData.utm_source}
                                            onChange={(e) => setFormData({...formData, utm_source: e.target.value})}
                                            placeholder="campaign (default)"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="utm_medium">UTM Medium</Label>
                                        <Input
                                            id="utm_medium"
                                            value={formData.utm_medium}
                                            onChange={(e) => setFormData({...formData, utm_medium: e.target.value})}
                                            placeholder="social (default)"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="utm_campaign">UTM Campaign</Label>
                                        <Input
                                            id="utm_campaign"
                                            value={formData.utm_campaign}
                                            onChange={(e) => setFormData({...formData, utm_campaign: e.target.value})}
                                            placeholder="auto-generated from slug"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="utm_content">UTM Content</Label>
                                        <Input
                                            id="utm_content"
                                            value={formData.utm_content}
                                            onChange={(e) => setFormData({...formData, utm_content: e.target.value})}
                                            placeholder="optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingLink ? 'Update' : 'Create'} Campaign Link
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Links</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Promo</TableHead>
                                    <TableHead>Landing</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaignLinks.map(link => {
                                    const shortLink = `${appUrl}/c/${link.slug}`;
                                    const previewUrl = buildPreviewUrl(link);
                                    const socialCopy = getSocialCopy(shortLink);
                                    
                                    return (
                                        <TableRow key={link.id}>
                                            <TableCell className="font-medium">{link.name}</TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {link.slug}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {link.promo_code ? (
                                                    <Badge variant="secondary">{link.promo_code}</Badge>
                                                ) : (
                                                    <span className="text-slate-400">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{link.landing_path}</TableCell>
                                            <TableCell>{link.clicks || 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={link.is_active ? 'default' : 'secondary'}>
                                                    {link.is_active ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(shortLink, 'Short link')}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleEdit(link)}
                                                    >
                                                        <Settings className="w-3 h-3" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => toggleActive(link.id, link.is_active)}
                                                    >
                                                        {link.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    </Button>
                                                </div>
                                                
                                                {/* Expanded details */}
                                                <details className="mt-2">
                                                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                                                        Show links & copy
                                                    </summary>
                                                    <div className="mt-2 space-y-2 p-2 bg-slate-50 rounded">
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-medium text-slate-700">Short Link:</div>
                                                            <div className="flex gap-1">
                                                                <code className="flex-1 text-xs p-1 bg-white rounded border">
                                                                    {shortLink}
                                                                </code>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost"
                                                                    onClick={() => copyToClipboard(shortLink, 'Short link')}
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-medium text-slate-700">Full URL:</div>
                                                            <div className="flex gap-1">
                                                                <code className="flex-1 text-xs p-1 bg-white rounded border truncate">
                                                                    {previewUrl}
                                                                </code>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost"
                                                                    onClick={() => copyToClipboard(previewUrl, 'Full URL')}
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <Tabs defaultValue="twitter" className="mt-3">
                                                            <TabsList className="grid w-full grid-cols-3">
                                                                <TabsTrigger value="twitter">Twitter</TabsTrigger>
                                                                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                                                                <TabsTrigger value="email">Email</TabsTrigger>
                                                            </TabsList>
                                                            
                                                            <TabsContent value="twitter" className="space-y-1">
                                                                <div className="flex gap-1">
                                                                    <Textarea 
                                                                        className="text-xs resize-none" 
                                                                        rows={3} 
                                                                        readOnly 
                                                                        value={socialCopy.twitter}
                                                                    />
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost"
                                                                        onClick={() => copyToClipboard(socialCopy.twitter, 'Twitter copy')}
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </TabsContent>
                                                            
                                                            <TabsContent value="linkedin" className="space-y-1">
                                                                <div className="flex gap-1">
                                                                    <Textarea 
                                                                        className="text-xs resize-none" 
                                                                        rows={4} 
                                                                        readOnly 
                                                                        value={socialCopy.linkedin}
                                                                    />
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost"
                                                                        onClick={() => copyToClipboard(socialCopy.linkedin, 'LinkedIn copy')}
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </TabsContent>
                                                            
                                                            <TabsContent value="email" className="space-y-1">
                                                                <div className="flex gap-1">
                                                                    <Textarea 
                                                                        className="text-xs resize-none" 
                                                                        rows={3} 
                                                                        readOnly 
                                                                        value={socialCopy.email}
                                                                    />
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost"
                                                                        onClick={() => copyToClipboard(socialCopy.email, 'Email copy')}
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                    </div>
                                                </details>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {campaignLinks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                            No campaign links created yet
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