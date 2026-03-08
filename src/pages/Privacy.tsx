import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Privacy = () => (
  <div className="min-h-screen page-grid">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 01/03/2026</p>
        <div className="space-y-6">
          {[
            { title: "1. Introduction", body: "Keyper (\"we\", \"our\", \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service." },
            { title: "2. Information we collect", body: "We collect your email address and password when you create an account. We do not collect or store your API keys in plaintext. All API keys are encrypted client-side before being transmitted to our servers." },
            { title: "3. How we use your information", body: "Your email is used for account authentication, password recovery, and important service notifications. We do not sell your data to third parties." },
            { title: "4. Data security", body: "We use industry-standard security measures including TLS encryption for data in transit, AES-256-GCM encryption for stored data, and secure session management. Your vault passphrase is never transmitted to or stored on our servers." },
            { title: "5. Data retention", body: "Your encrypted data is retained as long as your account is active. Upon account deletion, all associated data is permanently removed from our servers within 30 days." },
            { title: "6. Your rights", body: "You have the right to access, export, and delete your data at any time. You can export your vault as an encrypted backup and delete your account from the settings page." },
            { title: "7. Contact", body: "If you have questions about this Privacy Policy, please contact us at privacy@keyper.dev." },
          ].map((s, i) => (
            <section key={i} className="rounded-xl border border-border/50 bg-card/40 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
