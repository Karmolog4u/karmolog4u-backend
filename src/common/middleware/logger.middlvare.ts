import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    // const headers = request.headers;
    // this.logger.debug(headers);
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const statusMessage = response.statusMessage;
      this.logger.debug(
        `${method} ${originalUrl}   "${statusCode} ${statusMessage}"  ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
