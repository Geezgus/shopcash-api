import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import type * as z from 'zod';
import {
  AbstractBadRequestException,
  AbstractConflictException,
  AbstractDomainException,
  AbstractForbiddenException,
  AbstractNotFoundException,
  AbstractUnauthorizedException,
  AbstractUnprocessableEntityException,
} from '@shared/domain/exceptions/app.exceptions.js';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  detail: unknown;
  context?: Record<string, unknown>;
}

type DomainExceptionClass = abstract new (...args: any[]) => AbstractDomainException;

const DOMAIN_EXCEPTION_MAPPINGS: [DomainExceptionClass, HttpStatus, string][] = [
  [AbstractBadRequestException, HttpStatus.BAD_REQUEST, 'Bad request'],
  [AbstractUnauthorizedException, HttpStatus.UNAUTHORIZED, 'Unauthorized'],
  [AbstractForbiddenException, HttpStatus.FORBIDDEN, 'Forbidden'],
  [AbstractNotFoundException, HttpStatus.NOT_FOUND, 'Not found'],
  [AbstractConflictException, HttpStatus.CONFLICT, 'Conflict'],
  [AbstractUnprocessableEntityException, HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable entity'],
];

/**
 * Turns every exception into a consistent JSON error response:
 * `{ statusCode, message, errorCode, detail, context }`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const body = this.toErrorResponse(exception);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${body.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof ZodValidationException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        errorCode: 'VALIDATION_ERROR',
        detail: formatZodIssues(exception.getZodError()),
      };
    }

    if (exception instanceof ZodSerializationException) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Serialization error',
        errorCode: 'SERIALIZATION_ERROR',
        detail: 'An unexpected error occurred',
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      const detail =
        typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
          ? responseBody.message
          : responseBody;
      return {
        statusCode,
        message: exception.message,
        errorCode: 'HTTP_EXCEPTION',
        detail,
      };
    }

    if (exception instanceof AbstractDomainException) {
      // Exceptions extending AbstractDomainException directly are treated as bad requests.
      const [, statusCode, message] = DOMAIN_EXCEPTION_MAPPINGS.find(([type]) => exception instanceof type) ?? [
        AbstractDomainException,
        HttpStatus.BAD_REQUEST,
        'Bad request',
      ];
      return {
        statusCode,
        message,
        errorCode: exception.code,
        detail: exception.message,
        context: exception.context,
      };
    }

    // Also covers TokenExpiredError and NotBeforeError, which extend JsonWebTokenError.
    if (exception instanceof JsonWebTokenError) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        errorCode: 'INVALID_TOKEN',
        detail: exception.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      detail: 'An unexpected error occurred',
    };
  }
}

function formatZodIssues(error: unknown) {
  const issues = (error as z.ZodError | undefined)?.issues ?? [];
  return issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
}
