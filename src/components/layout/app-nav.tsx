"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/auth/sign-in", label: "로그인" },
  { href: "/auth/sign-up", label: "회원가입" },
];

type AppNavProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AppNav({ className, onNavigate }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            className={cn(
              "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            href={item.href}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
