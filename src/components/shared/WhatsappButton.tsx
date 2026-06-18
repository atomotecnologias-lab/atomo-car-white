import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappLink, generalMessage } from "@/lib/whatsapp";
import { mockSettings } from "@/data/mockSettings";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

export function WhatsappButton({
  message,
  children,
  variant = "default",
  size = "default",
  className,
  phone,
}: {
  message?: string;
  children?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  phone?: string;
}) {
  const url = whatsappLink(phone ?? mockSettings.whatsapp, message ?? generalMessage());
  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        {children ?? "Falar no WhatsApp"}
      </a>
    </Button>
  );
}
