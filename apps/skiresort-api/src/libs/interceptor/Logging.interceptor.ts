import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { visit } from 'graphql';
import type { GraphQLResolveInfo } from 'graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const recordTime = Date.now();
    const requestType = context.getType<GqlContextType>();

    if (requestType === 'http') {
      // Develop if needed

      return next.handle();
    } else if (requestType === 'graphql') {
      /**Print Request */

      const gqlContext = GqlExecutionContext.create(context);

      const info = gqlContext.getInfo<GraphQLResolveInfo>();
      let assistantOperation = info.fieldName === 'askAssistant';
      for (const node of [
        info.operation,
        ...Object.values(info.fragments ?? {}),
      ]) {
        if (node)
          visit(node, {
            Field: (field) => {
              if (field.name.value === 'askAssistant')
                assistantOperation = true;
            },
          });
      }
      if (assistantOperation) {
        return next.handle().pipe(
          tap({
            next: () =>
              this.logger.log(
                `${info.fieldName} success ${Date.now() - recordTime}ms`,
                'ASSISTANT',
              ),
            error: () =>
              this.logger.log(
                `${info.fieldName} error ${Date.now() - recordTime}ms`,
                'ASSISTANT',
              ),
          }),
        );
      }

      this.logger.log(
        `${this.stringify(gqlContext.getContext().req.body)}`,
        `REQUEST`,
      );

      /**Error handling graphql */

      /**If no Errors will be sent response */
      return next.handle().pipe(
        tap((context) => {
          const responseTime = Date.now() - recordTime;
          this.logger.log(
            `${this.stringify(context)} - ${responseTime}ms \n\n`,
            'RESPONSE',
          );
        }),
      );
    }

    return next.handle();
  }

  private stringify(context: ExecutionContext): string {
    return JSON.stringify(context).slice(0, 75);
  }
}
