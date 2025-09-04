
import { SendEmail } from "@/api/integrations";
import { User } from "@/api/entities";

class EmailService {
  static async sendWelcomeEmail(user) {
    try {
      const subject = "Welcome to REZEMAI - Your Executive Career Journey Begins";
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1A2F4B 0%, #B88B4A 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to REZEMAI</h1>
            <p style="margin: 10px 0 0; font-size: 16px;">Your AI-Powered Executive Career Platform</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #1A2F4B;">Hello ${user.full_name?.split(' ')[0] || 'Executive'},</h2>
            
            <p>Welcome to REZEMAI, the premier platform designed exclusively for C-suite executives and senior leaders like yourself.</p>
            
            <div style="background: #F8F8F8; padding: 20px; margin: 20px 0; border-left: 4px solid #B88B4A;">
              <h3 style="margin-top: 0; color: #1A2F4B;">Your 14-Day Premium Trial Starts Now</h3>
              <p>Experience all premium features including unlimited AI optimization, premium templates, and priority support.</p>
            </div>
            
            <h3 style="color: #1A2F4B;">Next Steps:</h3>
            <ol style="line-height: 1.8;">
              <li><strong>Complete your profile</strong> - Help us personalize your experience</li>
              <li><strong>Create your first résumé</strong> - Use our AI-powered builder</li>
              <li><strong>Practice interviewing</strong> - Build confidence with our AI coach</li>
              <li><strong>Explore premium templates</strong> - Stand out with executive designs</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://app.rezemai.com'}" 
                 style="background: #1A2F4B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Get Started Now
              </a>
            </div>
            
            <p>Questions? Reply to this email or visit our help center.</p>
            
            <p>Best regards,<br>The REZEMAI Team</p>
          </div>
          
          <div style="background: #F8F8F8; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>REZEMAI - Executive Career Platform<br>
            You're receiving this because you signed up for REZEMAI.</p>
          </div>
        </div>
      `;

      await SendEmail({
        to: user.email,
        subject: subject,
        body: body,
        from_name: "REZEMAI Team"
      });

      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  static async sendTrialEndingEmail(user, daysRemaining) {
    try {
      const subject = `Your REZEMAI trial ends in ${daysRemaining} days`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1A2F4B; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0;">Trial Ending Soon</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2>Hi ${user.full_name?.split(' ')[0] || 'there'},</h2>
            
            <p>Your 14-day REZEMAI premium trial expires in <strong>${daysRemaining} days</strong>.</p>
            
            <div style="background: #FEF3CD; border: 1px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #92400E;">Don't lose access to:</h3>
              <ul style="color: #92400E;">
                <li>Unlimited AI-powered résumé optimization</li>
                <li>Premium executive templates</li>
                <li>Advanced interview coaching</li>
                <li>Priority customer support</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://app.rezemai.com'}/profile?tab=account" 
                 style="background: #B88B4A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Upgrade to Premium - $29.99/month
              </a>
            </div>
            
            <p>Questions about upgrading? Just reply to this email.</p>
            
            <p>Best,<br>The REZEMAI Team</p>
          </div>
        </div>
      `;

      await SendEmail({
        to: user.email,
        subject: subject,
        body: body,
        from_name: "REZEMAI Team"
      });
    } catch (error) {
      console.error('Error sending trial ending email:', error);
    }
  }

  static async sendResumeOptimizedEmail(user, resume, atsScore) {
    try {
      const subject = `Your résumé has been optimized - ATS Score: ${atsScore}%`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0;">Résumé Optimization Complete</h1>
            <div style="font-size: 24px; font-weight: bold; margin-top: 10px;">ATS Score: ${atsScore}%</div>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2>Great news, ${user.full_name?.split(' ')[0]}!</h2>
            
            <p>Your résumé "${resume.title}" has been optimized with AI and achieved an ATS score of <strong>${atsScore}%</strong>.</p>
            
            ${atsScore >= 80 ? `
              <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #047857;">Excellent Score! 🎉</h3>
                <p style="color: #047857;">Your résumé is highly optimized for Applicant Tracking Systems and should perform well in your job search.</p>
              </div>
            ` : `
              <div style="background: #FEF3CD; border: 1px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #92400E;">Room for Improvement</h3>
                <p style="color: #92400E;">Consider reviewing the AI recommendations to boost your ATS score further.</p>
              </div>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://app.rezemai.com'}/resume-builder" 
                 style="background: #1A2F4B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                View Your Résumé
              </a>
            </div>
            
            <p>Ready to apply? Don't forget to download your polished résumé!</p>
            
            <p>Best of luck,<br>The REZEMAI Team</p>
          </div>
        </div>
      `;

      await SendEmail({
        to: user.email,
        subject: subject,
        body: body,
        from_name: "REZEMAI Team"
      });
    } catch (error) {
      console.error('Error sending optimization email:', error);
    }
  }

  static async sendWeeklyProgressEmail(user, stats) {
    try {
      const subject = "Your weekly REZEMAI progress report";
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1A2F4B; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0;">Weekly Progress Report</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2>Hi ${user.full_name?.split(' ')[0]},</h2>
            
            <p>Here's your career advancement progress from this week:</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0;">
              <div style="background: #F8F8F8; padding: 20px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px;">
                <div style="font-size: 24px; font-weight: bold; color: #1A2F4B;">${stats.resumesCreated || 0}</div>
                <div style="color: #666;">Résumés Created</div>
              </div>
              <div style="background: #F8F8F8; padding: 20px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px;">
                <div style="font-size: 24px; font-weight: bold; color: #B88B4A;">${stats.avgAtsScore || 0}%</div>
                <div style="color: #666;">Avg ATS Score</div>
              </div>
              <div style="background: #F8F8F8; padding: 20px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px;">
                <div style="font-size: 24px; font-weight: bold; color: #10B981;">${stats.interviewSessions || 0}</div>
                <div style="color: #666;">Practice Sessions</div>
              </div>
            </div>
            
            ${stats.resumesCreated === 0 ? `
              <div style="background: #EBF8FF; border: 1px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #1E40AF;">Ready to get started?</h3>
                <p style="color: #1E40AF;">Create your first executive résumé and take the next step in your career journey.</p>
              </div>
            ` : `
              <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #047857;">Keep up the momentum! 🚀</h3>
                <p style="color: #047857;">You're making great progress on your career advancement goals.</p>
              </div>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://app.rezemai.com'}" 
                 style="background: #1A2F4B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Continue Your Journey
              </a>
            </div>
            
            <p>To your success,<br>The REZEMAI Team</p>
          </div>
        </div>
      `;

      await SendEmail({
        to: user.email,
        subject: subject,
        body: body,
        from_name: "REZEMAI Team"
      });
    } catch (error) {
      console.error('Error sending weekly progress email:', error);
    }
  }
}

export default EmailService;
