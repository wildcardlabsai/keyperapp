import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import keyperLogo from "@/assets/keyper-logo.png";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Verify2FA = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") {
        navigate("/dashboard", { replace: true });
        return;
      }
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f: any) => f.status === "verified");
      if (!totp) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setFactorId(totp.id);
    };
    check();
  }, [navigate]);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      toast({ variant: "destructive", title: "Challenge failed", description: challengeErr.message });
      setLoading(false);
      return;
    }
    const { error: verifyErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (verifyErr) {
      toast({ variant: "destructive", title: "Invalid code", description: "Please check your authenticator app and try again." });
      setCode("");
      setLoading(false);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(213_94%_56%/0.06),transparent_60%)]" />
      <div className="relative w-full max-w-sm text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <img src={keyperLogo} alt="Keyper" className="h-9" />
        </Link>
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Two-factor authentication</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button onClick={handleVerify} disabled={code.length !== 6 || loading} className="w-full bg-gradient-primary border-0">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Verifying...</> : "Verify"}
        </Button>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Verify2FA;
