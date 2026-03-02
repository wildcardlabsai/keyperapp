import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Props = { children: React.ReactNode };

export const ProtectedRoute = ({ children }: Props) => {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/login", { replace: true });
      } else {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/login", { replace: true });
      else setReady(true);
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
