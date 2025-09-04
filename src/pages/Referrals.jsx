import React, { useState, useEffect } from 'react';
import { User, ReferralCode, ReferralAttribution } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, BarChart2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Referrals() {
    const [user, setUser] = useState(null);
    const [referralCode, setReferralCode] = useState('');
    const [attributions, setAttributions] = useState([]);
    const [stats, setStats] = useState({ clicks: 0, signups: 0, conversions: 0, rewards: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const appUrl = window.location.origin;
    const referralLink = referralCode ? `${appUrl}/app/ReferralRedirect?code=${referralCode}` : '';

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);

                if (currentUser.referral_code) {
                    setReferralCode(currentUser.referral_code);
                    const codeRecords = await ReferralCode.filter({ code: currentUser.referral_code });
                    const codeId = codeRecords[0]?.id;

                    if (codeId) {
                        const attrRecords = await ReferralAttribution.filter({ referral_code_id: codeId }, '-created_date');
                        setAttributions(attrRecords);
                        
                        // Calculate stats
                        const newStats = {
                            clicks: attrRecords.length, // Clicks are a superset of other statuses
                            signups: attrRecords.filter(a => ['signed_up', 'first_payment', 'reward_granted'].includes(a.status)).length,
                            conversions: attrRecords.filter(a => ['first_payment', 'reward_granted'].includes(a.status)).length,
                            rewards: attrRecords.filter(a => a.status === 'reward_granted').length,
                        };
                        setStats(newStats);
                    }
                } else {
                    // Generate a new code for the user if they don't have one
                    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    await ReferralCode.create({ user_id: currentUser.id, code: newCode });
                    await User.update(currentUser.id, { referral_code: newCode });
                    setReferralCode(newCode);
                }

            } catch (error) {
                console.error("Failed to load referral data:", error);
                toast.error("Could not load your referral information.");
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied!");
    };

    const statusMap = {
        clicked: { text: 'Link Clicked', color: 'bg-gray-200 text-gray-800' },
        signed_up: { text: 'Signed Up', color: 'bg-blue-100 text-blue-800' },
        first_payment: { text: 'Converted', color: 'bg-yellow-100 text-yellow-800' },
        reward_granted: { text: 'Reward Granted', color: 'bg-green-100 text-green-800' },
    };

    return (
        <div className="min-h-screen bg-warm-white p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Gift className="w-8 h-8 text-navy" />
                        <h1 className="text-3xl font-bold text-navy">Refer a Friend</h1>
                    </div>
                    <p className="text-slate-600">Give friends a head start, get $20 in credits when they make their first payment.</p>
                </div>
                
                <Card className="mb-8 border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Referral Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input value={referralLink} readOnly className="bg-slate-50"/>
                            <Button onClick={copyToClipboard} className="w-full sm:w-auto">
                                <Copy className="w-4 h-4 mr-2" /> Copy Link
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-navy">{stats.clicks}</p>
                            <p className="text-sm text-slate-500 capitalize">Clicks</p>
                        </CardContent>
                    </Card>
                     <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-navy">{stats.signups}</p>
                            <p className="text-sm text-slate-500 capitalize">Signups</p>
                        </CardContent>
                    </Card>
                     <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-navy">{stats.conversions}</p>
                            <p className="text-sm text-slate-500 capitalize">Conversions</p>
                        </CardContent>
                    </Card>
                     <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-navy">${stats.rewards * 20}</p>
                            <p className="text-sm text-slate-500 capitalize">Rewards Earned</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan="3" className="text-center">Loading...</TableCell></TableRow>
                                ) : attributions.length === 0 ? (
                                    <TableRow><TableCell colSpan="3" className="text-center">No referrals yet. Share your link to get started!</TableCell></TableRow>
                                ) : (
                                    attributions.map(attr => (
                                        <TableRow key={attr.id}>
                                            <TableCell>{new Date(attr.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge className={statusMap[attr.status]?.color}>{statusMap[attr.status]?.text}</Badge>
                                            </TableCell>
                                            <TableCell>{attr.notes || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}