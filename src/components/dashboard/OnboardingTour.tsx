import { useState } from "react";
import { X, Key, Shield, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to Keyper! 🎉",
    description: "Your zero-knowledge API key vault is ready. Let's take a quick tour of what you can do.",
  },
  {
    icon: Key,
    title: "Store your API keys",
    description: "Click 'Add key' to securely store your first API key. All keys are encrypted client-side before being saved.",
  },
  {
    icon: Shield,
    title: "Security first",
    description: "Check the Security tab to export encrypted backups, view your activity log, and monitor vault access.",
  },
  {
    icon: Settings,
    title: "Customize your vault",
    description: "Head to Settings to adjust auto-lock timing, change your password, or enable two-factor authentication.",
  },
];

type Props = {
  onComplete: () => void;
};

const OnboardingTour = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-border/50 bg-card p-8 relative shadow-2xl">
        <button onClick={onComplete} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
          <current.icon className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-xl font-bold mb-2">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">{current.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{step + 1} of {steps.length}</span>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < steps.length - 1 ? (
              <Button size="sm" className="bg-gradient-primary border-0" onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button size="sm" className="bg-gradient-primary border-0" onClick={onComplete}>Get started</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
