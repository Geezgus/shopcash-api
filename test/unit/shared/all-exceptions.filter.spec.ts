import type { ArgumentsHost } from '@nestjs/common';
import { ForbiddenException, Logger } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import {
  AbstractConflictException,
  AbstractNotFoundException,
  ValidationException,
} from '@shared/domain/exceptions/app.exceptions.js';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';
import { AllExceptionsFilter } from '@shared/infra/http/filters/all-exceptions.filter.js';

class ThingNotFoundException extends AbstractNotFoundException {
  readonly code = 'THING_NOT_FOUND';
}

class ThingAlreadyExistsException extends AbstractConflictException {
  readonly code = 'THING_ALREADY_EXISTS';
}

function run(exception: unknown) {
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', originalUrl: '/test' }),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  new AllExceptionsFilter().catch(exception, host);

  return { status: response.status.mock.calls[0][0], body: response.json.mock.calls[0][0] };
}

describe('AllExceptionsFilter', () => {
  it.each([
    [new ValidationException('bad'), 400, 'VALIDATION_ERROR'],
    [new InvalidArgumentException('bad'), 400, 'INVALID_ARGUMENT'],
    [new ThingNotFoundException('missing'), 404, 'THING_NOT_FOUND'],
    [new ThingAlreadyExistsException('dup'), 409, 'THING_ALREADY_EXISTS'],
    [new InvalidOperationException('nope'), 422, 'INVALID_OPERATION'],
    [new TokenExpiredError('jwt expired', new Date()), 401, 'INVALID_TOKEN'],
    [new ForbiddenException(), 403, 'HTTP_EXCEPTION'],
  ])('maps %o to %i', (exception, statusCode, errorCode) => {
    const { status, body } = run(exception);

    expect(status).toBe(statusCode);
    expect(body).toMatchObject({ statusCode, errorCode });
  });

  it('passes the domain exception context to the client', () => {
    const { body } = run(new ValidationException('bad', { field: 'name' }));

    expect(body.context).toEqual({ field: 'name' });
  });

  it('hides the details of unexpected errors', () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const { status, body } = run(new Error('connection string with secrets'));

    expect(status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('secrets');
  });
});
