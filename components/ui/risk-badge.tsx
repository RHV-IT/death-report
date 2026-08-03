import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RISK_GRADING_CLASSES: Record<string, string> = {
  Critical:
    "bg-red-50 text-red-700 border-red-200/70 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  High:
    "bg-orange-50 text-orange-700 border-orange-200/70 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  Medium:
    "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Low:
    "bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

export function RiskGradingBadge({ riskGrading, className }: { riskGrading: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", RISK_GRADING_CLASSES[riskGrading] || "bg-muted/50 text-muted-foreground border-border", className)}
    >
      {riskGrading || "—"}
    </Badge>
  );
}
