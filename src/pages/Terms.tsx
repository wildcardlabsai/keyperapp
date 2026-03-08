import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Terms = () => (
  <div className="min-h-screen page-grid">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 01/03/2026</p>
        <div className="space-y-6">
          {[
            { title: "1. Acceptance of terms", body: "By accessing or using Keyper, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service." },
            { title: "2. Description of service", body: "Keyper provides a secure, client-side encrypted vault for storing API keys and secrets. We offer free and paid plans with varying storage limits." },
            { title: "3. User responsibilities", body: "You are responsible for maintaining the confidentiality of your account credentials and vault passphrase. You must not share your account or use the service for illegal purposes." },
            { title: "4. Vault passphrase", body: "Your vault passphrase is used to encrypt and decrypt your stored keys. Keyper does not store your passphrase and cannot recover it. You acknowledge that losing your passphrase will result in permanent loss of access to your encrypted data." },
            { title: "5. Limitation of liability", body: "Keyper is provided \"as is\" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service." },
            { title: "6. Modifications", body: "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms." },
            { title: "7. Governing law", body: "These terms shall be governed by and construed in accordance with the laws of England and Wales." },
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

export default Terms;
