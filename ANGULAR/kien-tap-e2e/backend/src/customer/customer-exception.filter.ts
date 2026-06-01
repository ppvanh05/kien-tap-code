import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CustomerExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã có lỗi xảy ra trên hệ thống!';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = Array.isArray((res as any).message)
          ? (res as any).message.join(', ')
          : (res as any).message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Include additional details (fieldErrors) when provided by the exception response
    const res = exception instanceof HttpException ? exception.getResponse() : null;
    const fieldErrors = res && typeof res === 'object' && (res as any).fieldErrors ? (res as any).fieldErrors : undefined;

    const payload: any = {
      success: false,
      message: message,
    };
    if (fieldErrors) payload.fieldErrors = fieldErrors;

    response.status(status).json(payload);
  }
}
