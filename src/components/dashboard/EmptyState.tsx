import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: Props) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
      <Icon className="h-7 w-7 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-xs mb-5">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="bg-gradient-primary border-0">{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
