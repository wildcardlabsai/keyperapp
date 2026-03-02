import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Privacy = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 01/03/2026</p>
        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>Keyper ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information we collect</h2>
            <p>We collect your email address and password when you create an account. We do not collect or store your API keys in plaintext. All API keys are encrypted client-side before being transmitted to our servers.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How we use your information</h2>
            <p>Your email is used for account authentication, password recovery, and important service notifications. We do not sell your data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data security</h2>
            <p>We use industry-standard security measures including TLS encryption for data in transit, AES-256-GCM encryption for stored data, and secure session management. Your vault passphrase is never transmitted to or stored on our servers.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data retention</h2>
            <p>Your encrypted data is retained as long as your account is active. Upon account deletion, all associated data is permanently removed from our servers within 30 days.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your rights</h2>
            <p>You have the right to access, export, and delete your data at any time. You can export your vault as an encrypted backup and delete your account from the settings page.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Contact</h2>
            <p>If you have questions about this Privacy Policy, please contact us at privacy@keyper.dev.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
