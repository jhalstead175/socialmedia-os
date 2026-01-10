import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import supabase from '../config/supabaseClient';
import toast from 'react-hot-toast';

/**
 * LinkedIn OAuth Callback Page
 *
 * This page receives the OAuth callback from LinkedIn and forwards it to the
 * Supabase Edge Function with proper authentication.
 */
export default function LinkedInCallback() {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get OAuth parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        // Handle OAuth errors
        if (error) {
          console.error('LinkedIn OAuth error:', error);
          toast.error('LinkedIn authorization failed');
          navigate('/Account');
          return;
        }

        if (!code || !state) {
          toast.error('Invalid OAuth callback');
          navigate('/Account');
          return;
        }

        if (!clerkUser) {
          toast.error('Please sign in first');
          navigate('/signin?redirect=/Account');
          return;
        }

        // Call Supabase Edge Function with proper authentication
        const { data, error: callbackError } = await supabase.functions.invoke('oauth-linkedin-callback', {
          body: {
            code,
            state,
            userId: clerkUser.id
          }
        });

        if (callbackError) {
          console.error('OAuth callback error:', callbackError);
          toast.error('Failed to complete LinkedIn connection');
          navigate('/Account');
          return;
        }

        if (data?.error) {
          console.error('LinkedIn connection error:', data.error);
          toast.error(`Failed to connect LinkedIn: ${data.error}`);
          navigate('/Account');
          return;
        }

        // Success!
        toast.success('LinkedIn account connected successfully!');
        navigate('/Account?connected=linkedin');

      } catch (err) {
        console.error('Unexpected error in OAuth callback:', err);
        toast.error('An unexpected error occurred');
        navigate('/Account');
      }
    };

    handleCallback();
  }, [clerkUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Connecting your LinkedIn account...</p>
      </div>
    </div>
  );
}
