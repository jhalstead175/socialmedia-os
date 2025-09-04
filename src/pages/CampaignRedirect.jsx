import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { campaignRedirect } from '@/api/functions';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CampaignRedirect() {
    const { slug } = useParams();

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const { data } = await campaignRedirect({ slug });
                
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    // Fallback to homepage
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Campaign redirect failed:', error);
                // Fallback to homepage
                window.location.href = '/';
            }
        };

        if (slug) {
            handleRedirect();
        }
    }, [slug]);

    return (
        <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                    <h2 className="text-lg font-semibold mb-2">Redirecting...</h2>
                    <p className="text-slate-600">Taking you to your destination.</p>
                </CardContent>
            </Card>
        </div>
    );
}