import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Terms = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: 01/03/2026</p>
        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of terms</h2>
            <p>By accessing or using Keyper, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of service</h2>
            <p>Keyper provides a secure, client-side encrypted vault for storing API keys and secrets. We offer free and paid plans with varying storage limits.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. User responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and vault passphrase. You must not share your account or use the service for illegal purposes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Vault passphrase</h2>
            <p>Your vault passphrase is used to encrypt and decrypt your stored keys. Keyper does not store your passphrase and cannot recover it. You acknowledge that losing your passphrase will result in permanent loss of access to your encrypted data.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Limitation of liability</h2>
            <p>Keyper is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Governing law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of England and Wales.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;
