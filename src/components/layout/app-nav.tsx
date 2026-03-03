"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "logout"; label: string };

const guestNavItems: NavItem[] = [
  { kind: "link", href: "/", label: "홈" },
  { kind: "link", href: "/mock/chat", label: "채팅 목업" },
  { kind: "link", href: "/auth/sign-in", label: "로그인" },
  { kind: "link", href: "/auth/sign-up", label: "회원가입" },
];

const authedNavItems: NavItem[] = [
  { kind: "link", href: "/", label: "홈" },
  { kind: "link", href: "/mock/chat", label: "채팅 목업" },
  { kind: "logout", label: "로그아웃" },
];

type AppNavProps = {
  className?: string;
  onNavigate?: () => void;
  isAuthenticated?: boolean;
};

export function AppNav({
  className,
  onNavigate,
  isAuthenticated,
}: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const items = isAuthenticated ? authedNavItems : guestNavItems;

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      if (!response.ok) {
        // 실패 시에는 일단 새로고침만 해도 세션 상태가 맞춰질 수 있으므로 리프레시
        router.refresh();
        return;
      }

      if (onNavigate) {
        onNavigate();
      }
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className={className}>
      {items.map((item) => {
        if (item.kind === "link") {
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
        }

        return (
          <button
            key="logout"
            type="button"
            className={cn(
              "inline-flex h-9 w-full items-center rounded-lg px-3 text-sm font-medium transition-colors",
              "text-destructive hover:bg-destructive/10 hover:text-destructive",
              isSigningOut && "opacity-60",
            )}
            onClick={handleLogout}
            disabled={isSigningOut}
          >
            {isSigningOut ? "로그아웃 중..." : item.label}
          </button>
        );
      })}
    </nav>
  );
}
