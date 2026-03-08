import { Progress } from "@/components/ui/progress";

const getStrength = (pw: string): { score: number; label: string; colorClass: string } => {
  if (!pw) return { score: 0, label: "", colorClass: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 20, label: "Weak", colorClass: "text-destructive" };
  if (score <= 2) return { score: 40, label: "Fair", colorClass: "text-orange-500" };
  if (score <= 3) return { score: 60, label: "Good", colorClass: "text-yellow-500" };
  if (score <= 4) return { score: 80, label: "Strong", colorClass: "text-emerald-500" };
  return { score: 100, label: "Very strong", colorClass: "text-emerald-400" };
};

const strengthColors: Record<number, string> = {
  20: "hsl(0, 72%, 51%)",
  40: "hsl(25, 95%, 53%)",
  60: "hsl(45, 93%, 47%)",
  80: "hsl(160, 84%, 39%)",
  100: "hsl(160, 84%, 45%)",
};

const PasswordStrength = ({ password }: { password: string }) => {
  const { score, label, colorClass } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${score}%`, backgroundColor: strengthColors[score] }}
        />
      </div>
      <p className={`text-xs ${colorClass}`}>{label}</p>
    </div>
  );
};

export default PasswordStrength;
