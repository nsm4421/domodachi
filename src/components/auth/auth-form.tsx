"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import {
  AuthField,
  AuthFieldErrors,
  AuthFormValues,
  AuthMode,
  getAuthFieldErrors,
  validateAuthField,
} from "@/lib/validations/auth";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthApiResponse = {
  error?: string;
  needsEmailVerification?: boolean;
};

const modeText = {
  "sign-in": {
    title: "로그인",
    subtitle: "이메일과 비밀번호로 계속 진행하세요.",
    submit: "로그인",
    switchDescription: "계정이 없나요?",
    switchAction: "회원가입",
    switchHref: "/auth/sign-up",
    eyebrow: "인증",
  },
  "sign-up": {
    title: "회원가입",
    subtitle: "계정을 만들고 바로 시작하세요.",
    submit: "회원가입",
    switchDescription: "이미 계정이 있나요?",
    switchAction: "로그인",
    switchHref: "/auth/sign-in",
    eyebrow: "인증",
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const text = modeText[mode];

  const [values, setValues] = useState<AuthFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setFieldValue = (field: AuthField, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (fieldErrors[field]) {
      const nextMessage = validateAuthField(mode, field, nextValues);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: nextMessage ?? undefined,
      }));
    }

    if (
      mode === "sign-up" &&
      (field === "password" || field === "confirmPassword") &&
      fieldErrors.confirmPassword
    ) {
      const confirmMessage = validateAuthField(
        mode,
        "confirmPassword",
        nextValues,
      );
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: confirmMessage ?? undefined,
      }));
    }
  };

  const runFieldValidation = (field: AuthField) => {
    const message = validateAuthField(mode, field, values);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message ?? undefined,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationErrors = getAuthFieldErrors(mode, values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});

    setIsLoading(true);

    try {
      const endpoint =
        mode === "sign-in" ? "/api/auth/sign-in" : "/api/auth/sign-up";
      const payload =
        mode === "sign-in"
          ? {
              email: values.email,
              password: values.password,
            }
          : {
              email: values.email,
              password: values.password,
              username: values.username,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: AuthApiResponse | null = null;
      try {
        result = (await response.json()) as AuthApiResponse;
      } catch {
        result = null;
      }

      if (!response.ok) {
        setErrorMessage(
          result?.error ??
            "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }

      if (mode === "sign-in") {
        router.push("/");
        router.refresh();
      } else {
        const needsEmailVerification = result?.needsEmailVerification ?? true;
        setSuccessMessage(
          needsEmailVerification
            ? "회원가입이 완료되었습니다. 이메일 인증 링크를 확인해주세요."
            : "회원가입이 완료되었습니다. 로그인 상태로 이동합니다.",
        );

        if (!needsEmailVerification) {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setErrorMessage(
        "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl space-y-6">
      <PageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.subtitle}
      />

      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "sign-up" ? (
            <div className="space-y-1">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="username"
              >
                사용자 이름
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                className="border-input bg-background focus:border-ring w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                placeholder="사용할 이름을 입력하세요"
                value={values.username}
                onChange={(event) =>
                  setFieldValue("username", event.target.value)
                }
                onBlur={() => runFieldValidation("username")}
              />
              {fieldErrors.username ? (
                <p className="text-sm text-red-600">{fieldErrors.username}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1">
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="email"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="border-input bg-background focus:border-ring w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              placeholder="you@example.com"
              value={values.email}
              onChange={(event) => setFieldValue("email", event.target.value)}
              onBlur={() => runFieldValidation("email")}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-red-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="password"
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                minLength={6}
                required
                className="border-input bg-background focus:border-ring w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:outline-none"
                placeholder="6자 이상 입력"
                value={values.password}
                onChange={(event) =>
                  setFieldValue("password", event.target.value)
                }
                onBlur={() => runFieldValidation("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="text-sm text-red-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          {mode === "sign-up" ? (
            <div className="space-y-1">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="confirm-password"
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="border-input bg-background focus:border-ring w-full rounded-xl border px-3 py-2 pr-10 text-sm focus:outline-none"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    setFieldValue("confirmPassword", event.target.value)
                  }
                  onBlur={() => runFieldValidation("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center"
                  aria-label={
                    showConfirmPassword
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                  title={
                    showConfirmPassword
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p className="text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          ) : null}

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground w-full rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "처리 중..." : text.submit}
          </button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          {text.switchDescription}{" "}
          <Link
            className="text-foreground font-medium underline"
            href={text.switchHref}
          >
            {text.switchAction}
          </Link>
        </p>
      </div>
    </section>
  );
}
