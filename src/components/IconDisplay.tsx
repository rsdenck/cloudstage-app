import { cn } from "@/lib/utils";

interface IconDisplayProps {
  icon?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}

export function IconDisplay({ icon, className, fallback }: IconDisplayProps) {
  if (!icon) return <>{fallback}</>;

  if (icon.startsWith("mi:")) {
    const iconName = icon.replace("mi:", "");
    return (
      <span className={cn("material-icons", className)} style={{ fontSize: 'inherit' }}>
        {iconName}
      </span>
    );
  }

  return <span className={className}>{icon}</span>;
}
