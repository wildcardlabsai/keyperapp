import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const faqs = [
  { q: "How does Keyper encrypt my API keys?", a: "Keyper uses AES-256-GCM encryption, which happens entirely in your browser. Your vault passphrase is used to derive an encryption key via PBKDF2. The encrypted data is then stored securely — we never see or store your plaintext keys." },
  { q: "Can Keyper staff see my API keys?", a: "No. Keyper operates on a zero-knowledge architecture. We only store encrypted blobs. Without your vault passphrase, the data is unreadable — even to our team." },
  { q: "What happens if I forget my vault passphrase?", a: "Unfortunately, we cannot recover your vault passphrase. It is never stored on our servers. If you lose it, your encrypted keys cannot be decrypted. We strongly recommend keeping a secure backup of your passphrase." },
  { q: "Is my data safe if Keyper is breached?", a: "Yes. Even in the worst case, attackers would only obtain encrypted data. Without your vault passphrase, the keys remain completely unusable." },
  { q: "How does the free plan work?", a: "The free plan lets you store up to 10 API keys with full encryption, auto-hidden secrets, one-click copy, and encrypted backups. No credit card required." },
  { q: "How do I upgrade to Pro?", a: "Billing is currently in early access. You can activate a Pro demo from your dashboard to unlock unlimited key storage during this period." },
  { q: "Can I export my keys?", a: "Yes. You can export your entire vault as an encrypted backup file. This file can be imported on any device, provided you have your vault passphrase." },
  { q: "What browsers are supported?", a: "Keyper works on all modern browsers including Chrome, Firefox, Safari, and Edge. We use the Web Crypto API for encryption, which is supported across all major browsers." },
  { q: "Is Keyper open source?", a: "We are considering open-sourcing the encryption layer for transparency. Stay tuned for updates." },
];

const FAQ = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently asked questions</h1>
          <p className="text-lg text-muted-foreground">Everything you need to know about Keyper.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl bg-card/40 px-6 overflow-hidden">
              <AccordionTrigger className="text-left font-medium hover:no-underline py-5">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
    <Footer />
  </div>
);

export default FAQ;
