
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-violet-900/30 border border-violet-500/20", className)}
      {...props}
    />
  )
}

export { Skeleton }
