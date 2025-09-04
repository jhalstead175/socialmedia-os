import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link as LinkIcon,
  Copy,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SocialShare({ 
  url = window.location.href, 
  title = "Check out my professional résumé created with REZEMAI",
  description = "I used REZEMAI's AI-powered platform to create my executive résumé. Join thousands of leaders advancing their careers!",
  hashtags = "resume,career,executive,AI"
}) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags}`,
    linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Success</DialogTitle>
          <DialogDescription>
            Show others how REZEMAI helped advance your career
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => openShare('twitter')}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Twitter className="w-6 h-6 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openShare('linkedin')}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Linkedin className="w-6 h-6 text-blue-600" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openShare('facebook')}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Facebook className="w-6 h-6 text-blue-700" />
              <span className="text-xs">Facebook</span>
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Copy Link</p>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-slate-50 rounded border text-sm truncate">
                {url}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}