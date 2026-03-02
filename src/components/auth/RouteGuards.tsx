import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Props = { children: React.ReactNode };

export const ProtectedRoute = ({ children }: Props) => {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      // Check if user has MFA factors but hasn't completed aal2
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasVerifiedTotp = factors?.totp?.some((f: any) => f.status === "verified");

      if (hasVerifiedTotp && aal?.currentLevel !== "aal2") {
        navigate("/verify-2fa", { replace: true });
        return;
      }
      setReady(true);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/login", { replace: true });
      } else {
        check();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return null;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: Props) => {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!data) {
        navigate("/dashboard", { replace: true });
      } else {
        setReady(true);
      }
    };
    check();
  }, [navigate]);

  if (!ready) return null;
  return <>{children}</>;
};
