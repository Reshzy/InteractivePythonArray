"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Change theme"
          />
        }
      >
        <SunIcon className="dark:hidden" />
        <MoonIcon className="hidden dark:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {THEMES.map(({ value, label, icon: Icon }) => {
            const isCurrent = theme === value;

            return (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
              >
                <Icon />
                <span>{label}</span>
                {isCurrent ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Current
                  </span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
