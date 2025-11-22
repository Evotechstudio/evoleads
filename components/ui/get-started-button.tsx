import { Button, ButtonProps } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GetStartedButtonProps extends Omit<ButtonProps, 'children'> {
 text?: string;
}

export function GetStartedButton({
 text = "Get Started Free",
 className,
 size = "lg",
 ...props
}: GetStartedButtonProps) {
 return (
  <Button
   className={cn("group relative overflow-hidden", className)}
   size={size}
   {...props}
  >
   <span className="mr-8 transition-opacity duration-1000 group-hover:opacity-0">
    {text}
   </span>
   <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-1000 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-primary-foreground">
    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
   </i>
  </Button>
 );
}