import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Settings, X, Check, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = 'rezemai-cookie-consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 2000);
    } else {
      const saved = JSON.parse(savedConsent);
      setPreferences(saved);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    saveConsent(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    saveConsent(necessaryOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowSettings(false);
  };

  const saveConsent = (consent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...consent,
      timestamp: new Date().toISOString()
    }));
    setPreferences(consent);
    setShowBanner(false);
    
    // Here you would typically initialize analytics/marketing tools based on consent
    if (consent.analytics) {
      console.log('Analytics tracking enabled');
    }
    if (consent.marketing) {
      console.log('Marketing cookies enabled');
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Card className="border-navy/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="w-6 h-6 text-gold mt-1" />
                  <div>
                    <h3 className="font-semibold text-navy mb-2">We use cookies to enhance your experience</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      We use essential cookies to make our site work. We'd also like to set optional cookies to 
                      understand site usage and improve your experience. You can manage your preferences anytime.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 self-end md:self-center">
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Manage Preferences
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Cookie Preferences</DialogTitle>
                        <DialogDescription>
                          Choose which cookies you'd like to accept. You can change these settings anytime.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="font-medium">Necessary Cookies</Label>
                              <p className="text-xs text-slate-600">Required for the site to function properly</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                              <Switch checked={true} disabled />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="font-medium">Functional Cookies</Label>
                              <p className="text-xs text-slate-600">Remember your preferences and settings</p>
                            </div>
                            <Switch 
                              checked={preferences.functional}
                              onCheckedChange={(checked) => setPreferences(prev => ({...prev, functional: checked}))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="font-medium">Analytics Cookies</Label>
                              <p className="text-xs text-slate-600">Help us understand how you use our site</p>
                            </div>
                            <Switch 
                              checked={preferences.analytics}
                              onCheckedChange={(checked) => setPreferences(prev => ({...prev, analytics: checked}))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="font-medium">Marketing Cookies</Label>
                              <p className="text-xs text-slate-600">Personalize ads and content for you</p>
                            </div>
                            <Switch 
                              checked={preferences.marketing}
                              onCheckedChange={(checked) => setPreferences(prev => ({...prev, marketing: checked}))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={handleSavePreferences} className="flex-1">
                          <Check className="w-4 h-4 mr-2" />
                          Save Preferences
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm" onClick={handleAcceptNecessary}>
                    Necessary Only
                  </Button>
                  <Button size="sm" onClick={handleAcceptAll} className="bg-navy hover:bg-navy/90">
                    Accept All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}