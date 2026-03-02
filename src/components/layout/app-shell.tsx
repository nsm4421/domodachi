"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import {
  AuthUserState,
  ProfileAvatarButton,
} from "@/components/auth/profile-avatar-button";
import { AppNav } from "@/components/layout/app-nav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  initialAuth: AuthUserState;
};

export function AppShell({ children, initialAuth }: AppShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!isNavOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          isNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsNavOpen(false)}
      />

      <aside
        className={cn(
          "border-border bg-sidebar fixed top-0 left-0 z-50 h-full w-72 border-r p-4 transition-transform",
          isNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <Link
            className="text-lg font-semibold tracking-tight"
            href="/"
            onClick={() => setIsNavOpen(false)}
          >
            domodachi
          </Link>
          <button
            type="button"
            onClick={() => setIsNavOpen(false)}
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
            aria-label="내비게이션 닫기"
          >
            <X size={16} />
          </button>
        </div>

        <AppNav
          className="flex flex-col gap-1"
          onNavigate={() => setIsNavOpen(false)}
        />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="border-border bg-background/85 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNavOpen((prev) => !prev)}
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
              aria-label="내비게이션 열기"
            >
              <Menu size={16} />
            </button>
            <Link className="text-base font-semibold tracking-tight" href="/">
              domodachi
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ProfileAvatarButton initialAuth={initialAuth} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
