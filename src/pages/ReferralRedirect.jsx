import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// PRODUCTION FIX: js-cookie dependency removed (feature disabled for launch)
// import Cookies from 'js-cookie';
import { referralHandler } from '@/api/functions';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

// DISABLED FOR PRODUCTION LAUNCH
// This component is not routed - kept for future restoration
export default function ReferralRedirect() {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const navigate = useNavigate();

    useEffect(() => {
        const handleRedirect = async () => {
            if (code) {
                try {
                    const { data } = await referralHandler({ code });
                    if (data.success && data.found) {
                        // PRODUCTION FIX: Cookies.set removed (js-cookie not available)
                        // Cookies.set('referral_code', data.code, { expires: 90, path: '/', sameSite: 'Lax' });
                        console.log('Referral code stored:', data.code);
                    }
                } catch (error) {
                    console.error("Error processing referral code:", error);
                    // Fail gracefully, continue to signup
                }
            }
            // Always redirect to signup
            navigate(createPageUrl(`Signup?ref=${code || ''}`));
        };

        handleRedirect();
    }, [code, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-warm-white text-navy">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg">Redirecting you to our sign-up page...</p>
        </div>
    );
}