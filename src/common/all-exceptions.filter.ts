import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'Ocorreu um erro inesperado.';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') message = body;
      else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        message = (b.message as string | string[]) ?? exception.message;
        details = b.details ?? (Array.isArray(b.message) ? b.message : null);
        error = String(b.error ?? exception.name);
      }
      if (status === 400) error = 'Bad Request';
      if (status === 401) error = 'Unauthorized';
      if (status === 403) error = 'Forbidden';
      if (status === 404) error = 'Not Found';
      if (status === 409) error = 'Conflict';
      if (status === 422) error = 'Unprocessable Entity';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') { status = 409; error = 'Conflict'; message = 'Já existe um registro com um campo único informado.'; details = exception.meta; }
      else if (exception.code === 'P2025') { status = 404; error = 'Not Found'; message = 'Registro não encontrado.'; }
      else if (exception.code === 'P2003') { status = 409; error = 'Conflict'; message = 'A operação viola um relacionamento existente.'; }
    }
    response.status(status).json({ error, message, details, timestamp: new Date().toISOString(), path: request.url });
  }
}
