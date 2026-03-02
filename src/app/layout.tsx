import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { AuthUserState } from "@/components/auth/profile-avatar-button";
import { AppShell } from "@/components/layout/app-shell";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "domodachi",
  description: "게임 팀원 매칭 서비스 domodachi",
};

const themeScript = `
  (function () {
    try {
      var savedTheme = localStorage.getItem("theme");
      var theme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    } catch (_) {}
  })();
`;

async function getInitialAuthState(): Promise<AuthUserState> {
  if (!isSupabaseConfigured) {
    return {
      isAuthenticated: false,
      username: null,
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      isAuthenticated: false,
      username: null,
    };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return {
      isAuthenticated: false,
      username: null,
    };
  }

  const metadataUsername = data.user.user_metadata?.username;
  const normalizedMetadataUsername =
    typeof metadataUsername === "string" ? metadataUsername.trim() : "";
  const emailFallback = data.user.email?.split("@")[0]?.trim() ?? "";

  return {
    isAuthenticated: true,
    username: normalizedMetadataUsername || emailFallback || "사용자",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuth = await getInitialAuthState();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell initialAuth={initialAuth}>{children}</AppShell>
      </body>
    </html>
  );
}
