import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = 'December 13, 2024';
  const contactEmail = 'privacy@cozyhablts.app';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <section className="ios-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Your Privacy Matters</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cozy Habits ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our mobile application.
            </p>
          </section>

          {/* Data Collection */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Information We Collect</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Account Information</p>
                <p>Email address (for account creation and authentication)</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Habit Data</p>
                <p>Habits you create, completion status, streaks, and progress</p>
              </div>
              <div>
                <p className="font-medium text-foreground">App Preferences</p>
                <p>Theme settings, notification preferences, and customization choices</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Usage Analytics</p>
                <p>Anonymous app usage data to improve our service (e.g., feature usage, crash reports)</p>
              </div>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Information We Do NOT Collect</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Location data</li>
              <li>• Contact lists or phone numbers</li>
              <li>• Photos or media files</li>
              <li>• Health or biometric data</li>
              <li>• Financial information (payments handled by app stores)</li>
              <li>• Advertising identifiers for tracking</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">How We Use Your Information</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Provide and maintain the app functionality</li>
              <li>• Sync your habits and progress across devices</li>
              <li>• Send notifications you've opted into</li>
              <li>• Improve app performance and user experience</li>
              <li>• Provide customer support</li>
            </ul>
          </section>

          {/* Data Storage */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Data Storage & Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is securely stored using industry-standard encryption. We use Supabase, 
              a secure cloud database service, to store your information. Your data is never 
              sold or shared with third parties for marketing purposes.
            </p>
          </section>

          {/* Data Retention */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active. If you delete your 
              account, all associated data will be permanently removed within 30 days. 
              Anonymous analytics data may be retained for up to 12 months.
            </p>
          </section>

          {/* Your Rights */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Your Rights</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Access your personal data</li>
              <li>• Request data correction</li>
              <li>• Delete your account and data</li>
              <li>• Export your data</li>
              <li>• Opt out of analytics collection</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cozy Habits is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* Updates */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Policy Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new Privacy Policy on this page and updating the 
              "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <a 
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              {contactEmail}
            </a>
          </section>

          {/* Footer */}
          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Cozy Habits. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
