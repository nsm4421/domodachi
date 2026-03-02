"use client";

import { LogIn, LogOut, UserRound, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export type AuthUserState = {
  isAuthenticated: boolean;
  username: string | null;
};

type ProfileAvatarButtonProps = {
  initialAuth: AuthUserState;
};

function getDisplayName(username: string | null) {
  const normalized = username?.trim() ?? "";
  return normalized || "사용자";
}

function getAvatarLetter(username: string | null) {
  return getDisplayName(username)[0]?.toUpperCase() ?? "U";
}

export function ProfileAvatarButton({ initialAuth }: ProfileAvatarButtonProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthUserState>(initialAuth);

  useEffect(() => {
    setAuth(initialAuth);
  }, [initialAuth]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (containerRef.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  const onSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      if (!response.ok) {
        setErrorMessage("로그아웃에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      setAuth({ isAuthenticated: false, username: null });
      setIsOpen(false);
      router.refresh();
    } catch {
      setErrorMessage("로그아웃에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayName = getDisplayName(auth.username);
  const avatarLetter = getAvatarLetter(auth.username);
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          "border-border hover:bg-accent inline-flex h-9 items-center gap-2 rounded-full border px-2 pr-3 transition-colors",
          isOpen ? "bg-accent" : "bg-background",
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
            auth.isAuthenticated
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          {auth.isAuthenticated ? avatarLetter : <UserRound size={14} />}
        </span>
        <span className="text-sm font-medium">
          {auth.isAuthenticated ? displayName : "게스트"}
        </span>
      </button>

      {isOpen ? (
        <div
          className="border-border bg-popover text-popover-foreground absolute top-11 right-0 z-40 w-56 rounded-xl border p-2 shadow-lg"
          role="menu"
        >
          {auth.isAuthenticated ? (
            <>
              <p className="text-muted-foreground px-2 py-1 text-xs">
                {displayName} 계정으로 로그인됨
              </p>
              <button
                type="button"
                className="hover:bg-accent hover:text-accent-foreground inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors disabled:opacity-60"
                onClick={onSignOut}
                disabled={isSigningOut}
                role="menuitem"
              >
                <LogOut size={14} />
                {isSigningOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground px-2 py-1 text-xs">
                현재 게스트 상태입니다.
              </p>
              <Link
                className="hover:bg-accent hover:text-accent-foreground inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
                href="/auth/sign-up"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                <UserPlus size={14} />
                회원가입
              </Link>
              <Link
                className="hover:bg-accent hover:text-accent-foreground inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
                href="/auth/sign-in"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                <LogIn size={14} />
                로그인
              </Link>
            </>
          )}

          <div className="border-border mt-1 flex items-center justify-between border-t px-2 pt-2">
            <span className="text-muted-foreground text-xs">테마</span>
            <ThemeToggle />
          </div>

          {errorMessage ? (
            <p className="mt-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
