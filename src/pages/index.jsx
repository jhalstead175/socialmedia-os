import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Composer from "./Composer";

import Scheduler from "./Scheduler";

import Analytics from "./Analytics";

import Inbox from "./Inbox";

import Assets from "./Assets";

import Landing from "./Landing";

import Profile from "./Profile";

import TestingDashboard from "./TestingDashboard";

import Help from "./Help";

import Support from "./Support";

import AdminDashboard from "./AdminDashboard";

import Checkout from "./Checkout";

import Signin from "./Signin";

import Account from "./Account";

import LinkedInCallback from "./LinkedInCallback";

import WebhookTools from "./WebhookTools";

import Status from "./Status";

import Changelog from "./Changelog";

import SupportSLA from "./SupportSLA";

import Onboarding from "./Onboarding";

import LegalTerms from "./LegalTerms";

import LegalPrivacy from "./LegalPrivacy";

import AdminGrowth from "./AdminGrowth";

import AdminPromos from "./AdminPromos";

// DISABLED FOR PRODUCTION: Missing js-cookie dependency
// import ReferralRedirect from "./ReferralRedirect";

import Referrals from "./Referrals";

import CampaignRedirect from "./CampaignRedirect";

import AdminCampaignLinks from "./AdminCampaignLinks";

import FAQ from "./FAQ";

import Contact from "./Contact";

import Pricing from "./Pricing";

import Email from "./Email";

import EmailContacts from "./EmailContacts";

import EmailCampaigns from "./EmailCampaigns";

import EmailCampaignBuilder from "./EmailCampaignBuilder";

import EmailSettings from "./EmailSettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Dashboard: Dashboard,

    Composer: Composer,

    Scheduler: Scheduler,

    Analytics: Analytics,

    Inbox: Inbox,

    Assets: Assets,

    Landing: Landing,

    Profile: Profile,
    
    TestingDashboard: TestingDashboard,
    
    Help: Help,
    
    Support: Support,
    
    AdminDashboard: AdminDashboard,
    
    Checkout: Checkout,
    
    Signin: Signin,
    
    Account: Account,

    LinkedInCallback: LinkedInCallback,

    WebhookTools: WebhookTools,
    
    Status: Status,
    
    Changelog: Changelog,
    
    SupportSLA: SupportSLA,
    
    Onboarding: Onboarding,
    
    LegalTerms: LegalTerms,
    
    LegalPrivacy: LegalPrivacy,
    
    AdminGrowth: AdminGrowth,
    
    AdminPromos: AdminPromos,

    // DISABLED FOR PRODUCTION: Missing js-cookie dependency
    // ReferralRedirect: ReferralRedirect,

    Referrals: Referrals,
    
    CampaignRedirect: CampaignRedirect,
    
    AdminCampaignLinks: AdminCampaignLinks,
    
    FAQ: FAQ,
    
    Contact: Contact,
    
    Pricing: Pricing,

    Email: Email,

    EmailContacts: EmailContacts,

    EmailCampaigns: EmailCampaigns,

    EmailCampaignBuilder: EmailCampaignBuilder,

    EmailSettings: EmailSettings,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    console.log("Current page:", currentPage);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                    <Route path="/" element={<Landing />} />


                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/Composer" element={<Composer />} />

                <Route path="/Scheduler" element={<Scheduler />} />

                <Route path="/Analytics" element={<Analytics />} />

                <Route path="/Inbox" element={<Inbox />} />

                <Route path="/Assets" element={<Assets />} />

                <Route path="/Landing" element={<Landing />} />

                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/TestingDashboard" element={<TestingDashboard />} />
                
                <Route path="/Help" element={<Help />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/Signin" element={<Signin />} />
                
                <Route path="/Account" element={<Account />} />

                <Route path="/oauth/linkedin/callback" element={<LinkedInCallback />} />
                <Route path="/LinkedInCallback" element={<LinkedInCallback />} />

                <Route path="/WebhookTools" element={<WebhookTools />} />
                
                <Route path="/Status" element={<Status />} />
                
                <Route path="/Changelog" element={<Changelog />} />
                
                <Route path="/SupportSLA" element={<SupportSLA />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/LegalTerms" element={<LegalTerms />} />
                
                <Route path="/LegalPrivacy" element={<LegalPrivacy />} />
                
                <Route path="/AdminGrowth" element={<AdminGrowth />} />
                
                <Route path="/AdminPromos" element={<AdminPromos />} />

                {/* DISABLED FOR PRODUCTION: Missing js-cookie dependency */}
                {/* <Route path="/ReferralRedirect" element={<ReferralRedirect />} /> */}

                <Route path="/Referrals" element={<Referrals />} />
                
                <Route path="/CampaignRedirect" element={<CampaignRedirect />} />
                
                <Route path="/AdminCampaignLinks" element={<AdminCampaignLinks />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Pricing" element={<Pricing />} />

                <Route path="/Email" element={<Email />} />
                <Route path="/email" element={<Email />} />

                <Route path="/EmailContacts" element={<EmailContacts />} />
                <Route path="/emailcontacts" element={<EmailContacts />} />

                <Route path="/EmailCampaigns" element={<EmailCampaigns />} />
                <Route path="/emailcampaigns" element={<EmailCampaigns />} />

                <Route path="/EmailCampaignBuilder" element={<EmailCampaignBuilder />} />
                <Route path="/emailcampaignbuilder" element={<EmailCampaignBuilder />} />

                <Route path="/EmailSettings" element={<EmailSettings />} />
                <Route path="/emailsettings" element={<EmailSettings />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}