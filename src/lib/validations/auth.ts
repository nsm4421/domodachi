import { z } from "zod";

export type AuthMode = "sign-in" | "sign-up";

export type AuthFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
};

export type AuthField = keyof AuthFormValues;
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

const emailSchema = z
  .string()
  .trim()
  .min(1, "이메일을 입력해주세요.")
  .email("올바른 이메일 형식을 입력해주세요.");

const passwordSchema = z
  .string()
  .min(1, "비밀번호를 입력해주세요.")
  .min(6, "비밀번호는 6자 이상이어야 합니다.");

const usernameSchema = z
  .string()
  .trim()
  .min(1, "사용자 이름을 입력해주세요.")
  .min(3, "사용자 이름은 3자 이상이어야 합니다.")
  .max(30, "사용자 이름은 30자 이하여야 합니다.");

const confirmPasswordSchema = z
  .string()
  .min(1, "비밀번호 확인을 입력해주세요.");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    username: usernameSchema,
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
  });

function getSchema(mode: AuthMode) {
  return mode === "sign-in" ? signInSchema : signUpSchema;
}

export function getAuthFieldErrors(
  mode: AuthMode,
  values: AuthFormValues,
): AuthFieldErrors {
  const result = getSchema(mode).safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: AuthFieldErrors = {};

  for (const issue of result.error.issues) {
    const path = issue.path[0];
    if (typeof path !== "string") {
      continue;
    }

    const field = path as AuthField;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function validateAuthField(
  mode: AuthMode,
  field: AuthField,
  values: AuthFormValues,
): string | null {
  if (
    mode === "sign-in" &&
    (field === "username" || field === "confirmPassword")
  ) {
    return null;
  }

  const errors = getAuthFieldErrors(mode, values);
  return errors[field] ?? null;
}
