import type { LineProps } from "@/lib/blog/schema";
import { cn } from "@/lib/blog/utils";

export function Line({ thickness, color }: LineProps) {
  const colorClass =
    color === "accent"
      ? "border-accent"
      : color === "foreground"
        ? "border-foreground"
        : "border-border";
  return (
    <hr
      className={cn(
        "w-full border-0 border-t",
        colorClass,
        thickness === 2 ? "border-t-2" : "border-t"
      )}
    />
  );
}
