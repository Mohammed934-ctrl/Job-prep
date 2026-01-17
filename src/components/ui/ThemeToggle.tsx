"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { name: "Light", Icon: Sun, value: "light" },
  { name: "Dark", Icon: Moon, value: "dark" },
  { name: "System", Icon: Monitor, value: "system" },
] as const;

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, theme, resolvedTheme } = useTheme();

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {resolvedTheme === "dark" ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-36 rounded-xl p-1"
      >
        {themes.map(({ name, Icon, value }) => {
          const isActive = theme === value;

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors cursor-pointer",

               
                !isActive && "hover:bg-accent/90",

                
                isActive &&
                  "bg-primary text-foreground hover:bg-primary"
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              />
              <span className="text-sm">{name}</span>

              {isActive && (
                <span className="ml-auto text-xs opacity-60">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
