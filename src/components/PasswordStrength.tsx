import { Progress } from "@/components/ui/progress";

const getStrength = (pw: string): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 20, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score: 40, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score: 60, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score: 80, label: "Strong", color: "bg-emerald-500" };
  return { score: 100, label: "Very strong", color: "bg-emerald-400" };
};

const PasswordStrength = ({ password }: { password: string }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <Progress value={score} className={`h-1.5 [&>div]:${color}`} />
      <p className={`text-xs ${score <= 40 ? "text-destructive" : score <= 60 ? "text-yellow-500" : "text-emerald-500"}`}>
        {label}
      </p>
    </div>
  );
};

export default PasswordStrength;
