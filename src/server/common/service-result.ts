export const SERVICE_ERROR_CODES = {
  INVALID_ARGUMENT: "INVALID_ARGUMENT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  TIMEOUT: "TIMEOUT",
  UNAVAILABLE: "UNAVAILABLE",
  DB_ERROR: "DB_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type KnownServiceErrorCode =
  (typeof SERVICE_ERROR_CODES)[keyof typeof SERVICE_ERROR_CODES];
export type ServiceErrorCode = KnownServiceErrorCode | (string & {});

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
  operation: string;
  cause?: unknown;
};

export type ServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ServiceError;
    };

export function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function failure(error: ServiceError): ServiceResult<never> {
  return { ok: false, error };
}

type ErrorLike = {
  code?: unknown;
  status?: unknown;
  message?: unknown;
  name?: unknown;
};

const STATUS_TO_CODE: Readonly<Record<number, KnownServiceErrorCode>> = {
  400: SERVICE_ERROR_CODES.INVALID_ARGUMENT,
  401: SERVICE_ERROR_CODES.UNAUTHORIZED,
  403: SERVICE_ERROR_CODES.FORBIDDEN,
  404: SERVICE_ERROR_CODES.NOT_FOUND,
  409: SERVICE_ERROR_CODES.CONFLICT,
  429: SERVICE_ERROR_CODES.RATE_LIMITED,
  500: SERVICE_ERROR_CODES.INTERNAL_ERROR,
  502: SERVICE_ERROR_CODES.UNAVAILABLE,
  503: SERVICE_ERROR_CODES.UNAVAILABLE,
  504: SERVICE_ERROR_CODES.TIMEOUT,
};

const CODE_ALIASES: Readonly<Record<string, KnownServiceErrorCode>> = {
  BAD_REQUEST: SERVICE_ERROR_CODES.INVALID_ARGUMENT,
  VALIDATION_ERROR: SERVICE_ERROR_CODES.INVALID_ARGUMENT,
  UNPROCESSABLE_ENTITY: SERVICE_ERROR_CODES.INVALID_ARGUMENT,
  UNAUTHENTICATED: SERVICE_ERROR_CODES.UNAUTHORIZED,
  ACCESS_DENIED: SERVICE_ERROR_CODES.FORBIDDEN,
  PERMISSION_DENIED: SERVICE_ERROR_CODES.FORBIDDEN,
  RESOURCE_NOT_FOUND: SERVICE_ERROR_CODES.NOT_FOUND,
  UNIQUE_VIOLATION: SERVICE_ERROR_CODES.CONFLICT,
  DUPLICATE_KEY: SERVICE_ERROR_CODES.CONFLICT,
  TOO_MANY_REQUESTS: SERVICE_ERROR_CODES.RATE_LIMITED,
  ETIMEDOUT: SERVICE_ERROR_CODES.TIMEOUT,
  ECONNABORTED: SERVICE_ERROR_CODES.TIMEOUT,
  ECONNREFUSED: SERVICE_ERROR_CODES.UNAVAILABLE,
  EAI_AGAIN: SERVICE_ERROR_CODES.UNAVAILABLE,
  SQLITE_CONSTRAINT: SERVICE_ERROR_CODES.CONFLICT,
  "23505": SERVICE_ERROR_CODES.CONFLICT,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNormalizedCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeCode(value: unknown): ServiceErrorCode | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = toNormalizedCode(value);
  if (!normalized) {
    return null;
  }

  if (
    Object.values(SERVICE_ERROR_CODES).includes(
      normalized as KnownServiceErrorCode,
    )
  ) {
    return normalized as KnownServiceErrorCode;
  }

  if (normalized in CODE_ALIASES) {
    return CODE_ALIASES[normalized];
  }

  // Keep unknown/forward-compatible custom string codes.
  return normalized;
}

function inferCodeFromMessage(message: string): ServiceErrorCode {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid") ||
    lower.includes("validation") ||
    lower.includes("malformed")
  ) {
    return SERVICE_ERROR_CODES.INVALID_ARGUMENT;
  }

  if (lower.includes("not found")) {
    return SERVICE_ERROR_CODES.NOT_FOUND;
  }

  if (
    lower.includes("already exists") ||
    lower.includes("duplicate") ||
    lower.includes("unique")
  ) {
    return SERVICE_ERROR_CODES.CONFLICT;
  }

  if (lower.includes("forbidden") || lower.includes("permission")) {
    return SERVICE_ERROR_CODES.FORBIDDEN;
  }

  if (lower.includes("unauthorized") || lower.includes("authentication")) {
    return SERVICE_ERROR_CODES.UNAUTHORIZED;
  }

  if (lower.includes("timeout")) {
    return SERVICE_ERROR_CODES.TIMEOUT;
  }

  if (
    lower.includes("connection refused") ||
    lower.includes("network") ||
    lower.includes("temporarily unavailable")
  ) {
    return SERVICE_ERROR_CODES.UNAVAILABLE;
  }

  return SERVICE_ERROR_CODES.INTERNAL_ERROR;
}

function toErrorLike(error: unknown): ErrorLike {
  if (error instanceof Error) {
    return error as ErrorLike;
  }

  if (isRecord(error)) {
    return error;
  }

  return {};
}

function toErrorMessage(error: unknown, errorLike: ErrorLike): string {
  if (
    typeof errorLike.message === "string" &&
    errorLike.message.trim().length > 0
  ) {
    return errorLike.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return "Unexpected error";
}

export function toServiceError(
  operation: string,
  error: unknown,
): ServiceError {
  const errorLike = toErrorLike(error);
  const message = toErrorMessage(error, errorLike);
  const codeByField = normalizeCode(errorLike.code);
  const status =
    typeof errorLike.status === "number"
      ? STATUS_TO_CODE[errorLike.status]
      : undefined;
  const codeByName = normalizeCode(errorLike.name);
  const code =
    codeByField ?? status ?? codeByName ?? inferCodeFromMessage(message);

  return {
    code,
    message,
    operation,
    cause: error,
  };
}

export async function tryService<T>(
  operation: string,
  work: () => Promise<T>,
): Promise<ServiceResult<T>> {
  try {
    return success(await work());
  } catch (error) {
    return failure(toServiceError(operation, error));
  }
}
