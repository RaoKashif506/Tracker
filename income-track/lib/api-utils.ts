import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function handleZodError(error: ZodError) {
  const fieldErrors: Record<string, unknown> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    fieldErrors[path] = err.message;
  });

  return errorResponse('VALIDATION_ERROR', 'Validation failed', fieldErrors, 422);
}

export function handleDbError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof Error) {
    if (error.message.includes('duplicate key')) {
      return errorResponse('DUPLICATE_ENTRY', 'This record already exists', undefined, 409);
    }
  }

  return errorResponse('DATABASE_ERROR', 'An error occurred while accessing the database', undefined, 500);
}

export function unauthorized(): NextResponse<ApiErrorResponse> {
  return errorResponse('UNAUTHORIZED', 'Unauthorized access', undefined, 401);
}

export function forbidden(): NextResponse<ApiErrorResponse> {
  return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
}

export function notFound(): NextResponse<ApiErrorResponse> {
  return errorResponse('NOT_FOUND', 'Resource not found', undefined, 404);
}
