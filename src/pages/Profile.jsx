
import React, { useState, useEffect } from "react";
import { User, Resume, InterviewSession } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Settings,
  FileText,
  Download,
  Save,
  CheckCircle,
  AlertCircle,
  Share2, // New icon
  UploadCloud, // New icon
  Lock // New icon for Security/Premium placeholder
} from "lucide-react";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { format } from "date-fns";

import DataImportExport from "../components/profile/DataImportExport";
import ResumeSharing from "../components/profile/ResumeSharing";
import SubscriptionManager from "../components/subscription/SubscriptionManager"; // Kept, but UI removed
import EmailService from "../components/email/EmailService"; // Kept, but UI removed
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]); // Renamed from userResumes
  const [sessions, setSessions] = useState([]); // Renamed from userSessions
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    bio: '',
    current_title: '',
    company: '',
    industry: '',
    years_experience: ''
  });

  const loadData = async () => { // Renamed from loadUserData
    setIsLoading(true);
    try {
      const [userData, resumeData, sessionData] = await Promise.all([
        User.me(),
        Resume.list('-updated_date', 50),
        InterviewSession.list('-created_date', 50)
      ]);

      setUser(userData);
      setResumes(resumeData); // Updated state setter
      setSessions(sessionData); // Updated state setter
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        linkedin: userData.linkedin || '',
        bio: userData.bio || '',
        current_title: userData.current_title || '',
        company: userData.company || '',
        industry: userData.industry || '',
        years_experience: userData.years_experience || ''
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData(); // Call the new loadData function
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData(formData);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating profile. Please try again.');
      console.error("Profile update error:", error);
    }
    setSaving(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setSaveMessage('Error logging out. Please try again.');
    }
  };

  // This function is still present but its UI trigger is removed in the new tab structure
  const sendTestEmail = async () => {
    try {
      const currentUser = await User.me();
      await EmailService.sendWelcomeEmail(currentUser);
      setSaveMessage('Test email sent successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error sending test email.');
      console.error('Test email error:', error);
    }
  };

  // Function to trigger a data refresh, passed to children components
  const handleUpdate = () => {
    loadData();
  };

  // Calculate user statistics
  const stats = {
    totalResumes: resumes.length, // Updated variable name
    avgAtsScore: resumes.length > 0
      ? Math.round(resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) / resumes.length)
      : 0,
    totalSessions: sessions.length, // Updated variable name
    avgPerformance: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / sessions.length)
      : 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-navy rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 md:w-8 md:h-8 text-warm-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-navy">Profile & Settings</h1>
              <p className="text-slate-600 text-sm md:text-base">Manage your account, data, and preferences</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="self-start md:self-center border-red-200 text-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-navy">{stats.totalResumes}</div>
                <div className="text-xs text-slate-600">Résumés</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gold text-navy mx-auto mb-2 flex items-center justify-center text-xs rounded">
                  {stats.avgAtsScore}%
                </div>
                <div className="text-xl md:text-2xl font-bold text-navy">{stats.avgAtsScore}%</div>
                <div className="text-xs text-slate-600">Avg ATS</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-purple-600 mx-auto mb-2" /> {/* Replaced Video with Settings */}
                <div className="text-xl md:text-2xl font-bold text-navy">{stats.totalSessions}</div>
                <div className="text-xs text-slate-600">Sessions</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-gold mx-auto mb-2" /> {/* Replaced Crown with Lock */}
                <div className="text-sm font-bold text-navy">Premium</div>
                <div className="text-xs text-slate-600">Plan Status</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {saveMessage && (
          <Alert className={`mb-6 ${saveMessage.includes('Error') ? 'border-red-200' : 'border-green-200'}`}>
            {saveMessage.includes('Error') ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        {/* Main Content - Updated Tabs Structure */}
        <div className="md:col-span-3"> {/* Added div for layout as per outline */}
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 mb-6"> {/* Updated grid-cols and added mb-6 */}
              <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="sharing" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sharing</span>
              </TabsTrigger>
              <TabsTrigger value="import_export" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Data</span> {/* Changed label from Import/Export to Data */}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"> {/* Added flex items-center gap-2 */}
                    <UserIcon className="w-5 h-5 text-navy" /> {/* Added UserIcon */}
                    Personal Information
                  </CardTitle>
                  <p className="text-slate-500">This information helps us tailor your experience.</p> {/* Added new paragraph */}
                </CardHeader>
                <CardContent className="space-y-6"> {/* Changed space-y to 6 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="text-sm font-semibold">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="current_title" className="text-sm font-semibold">Current Title</Label>
                      <Input
                        id="current_title"
                        value={formData.current_title}
                        onChange={(e) => handleInputChange('current_title', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm font-semibold">Current Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry" className="text-sm font-semibold">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="years_experience" className="text-sm font-semibold">Years of Experience</Label>
                      <Input
                        id="years_experience"
                        type="number"
                        value={formData.years_experience}
                        onChange={(e) => handleInputChange('years_experience', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-semibold">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="mt-1 h-24"
                      placeholder="Brief professional summary..."
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-navy hover:bg-navy/90 text-warm-white"
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"> {/* Added flex items-center gap-2 */}
                    <Settings className="w-5 h-5 text-navy" /> {/* Added Settings icon */}
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for future settings */}
                  <p className="text-slate-600">Theme, notifications, and other settings will go here.</p>
                  {/* Example: Add a button to manage subscription, or the entire SubscriptionManager component */}
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Subscription</h3>
                    <SubscriptionManager /> {/* Re-integrated SubscriptionManager here */}
                  </div>
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Email Preferences</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-semibold">Welcome Emails</div>
                        <div className="text-sm text-slate-600">Get started guides and tips</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={sendTestEmail}>
                        Test Email
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mt-2">
                      <div>
                        <div className="font-semibold">Progress Reports</div>
                        <div className="text-sm text-slate-600">Weekly career advancement updates</div>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mt-2">
                      <div>
                        <div className="font-semibold">Optimization Alerts</div>
                        <div className="text-sm text-slate-600">When your résumé is processed</div>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Security & Privacy</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-semibold">Two-Factor Authentication</div>
                        <div className="text-sm text-slate-600">Add an extra layer of security</div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mt-2">
                      <div>
                        <div className="font-semibold">Email Notifications</div>
                        <div className="text-sm text-slate-600">Receive updates about your account</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 mt-2">
                      <div>
                        <div className="font-semibold text-red-800">Delete Account</div>
                        <div className="text-sm text-red-600">Permanently delete your account and data</div>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sharing Tab */}
            <TabsContent value="sharing">
              <ResumeSharing resumes={resumes} onUpdate={handleUpdate} /> {/* Pass resumes and onUpdate */}
            </TabsContent>

            {/* Data (Import/Export) Tab */}
            <TabsContent value="import_export">
              <DataImportExport
                resumes={resumes} // Pass resumes
                sessions={sessions} // Pass sessions
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
