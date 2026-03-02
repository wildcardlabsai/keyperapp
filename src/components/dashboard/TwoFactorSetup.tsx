import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Factor = { id: string; friendly_name?: string; factor_type: string };

const TwoFactorSetup = () => {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const { toast } = useToast();

  const loadFactors = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      setFactors(data.totp.filter((f: any) => f.status === "verified"));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleEnroll = async () => {
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator App" });
    if (error) {
      toast({ variant: "destructive", title: "Enrollment failed", description: error.message });
      setEnrolling(false);
      return;
    }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return;
    setVerifying(true);
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      toast({ variant: "destructive", title: "Challenge failed", description: challengeErr.message });
      setVerifying(false);
      return;
    }
    const { error: verifyErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: verifyCode });
    if (verifyErr) {
      toast({ variant: "destructive", title: "Verification failed", description: verifyErr.message });
      setVerifying(false);
      return;
    }
    toast({ title: "2FA enabled", description: "Two-factor authentication is now active on your account." });
    setEnrolling(false);
    setQrCode("");
    setFactorId("");
    setVerifyCode("");
    setVerifying(false);
    loadFactors();
  };

  const handleUnenroll = async (id: string) => {
    setUnenrolling(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      toast({ variant: "destructive", title: "Failed to disable 2FA", description: error.message });
    } else {
      toast({ title: "2FA disabled", description: "Two-factor authentication has been removed." });
    }
    setUnenrolling(false);
    loadFactors();
  };

  const cancelEnroll = async () => {
    if (factorId) {
      await supabase.auth.mfa.unenroll({ factorId });
    }
    setEnrolling(false);
    setQrCode("");
    setFactorId("");
    setVerifyCode("");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading 2FA status...
      </div>
    );
  }

  const isEnabled = factors.length > 0;

  // Enrollment flow — show QR code
  if (enrolling && qrCode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4 text-primary" /> Set up authenticator app
        </div>
        <p className="text-sm text-muted-foreground">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the 6-digit code below.
        </p>
        <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
          <img src={qrCode} alt="TOTP QR Code" className="h-48 w-48" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-medium">Enter verification code</label>
          <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" size="sm" onClick={cancelEnroll}>Cancel</Button>
            <Button size="sm" onClick={handleVerify} disabled={verifyCode.length !== 6 || verifying} className="bg-gradient-primary border-0">
              {verifying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Verifying...</> : "Verify & enable"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="h-4 w-4 text-accent" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            Two-factor authentication {isEnabled ? "enabled" : "disabled"}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {isEnabled
          ? "Your account is protected with TOTP-based two-factor authentication."
          : "Add an extra layer of security by requiring a code from your authenticator app at login."}
      </p>
      {isEnabled ? (
        <Button variant="outline" size="sm" onClick={() => handleUnenroll(factors[0].id)} disabled={unenrolling}>
          {unenrolling ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Disabling...</> : "Disable 2FA"}
        </Button>
      ) : (
        <Button size="sm" onClick={handleEnroll} className="bg-gradient-primary border-0">
          Enable 2FA
        </Button>
      )}
    </div>
  );
};

export default TwoFactorSetup;
