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
import type { GraphQLResolveInfo } from 'graphql';
import { visit } from 'graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<GqlContextType>() !== 'graphql') return next.handle();
    const started = Date.now();
    const info =
      GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();
    let assistantOperation = info.fieldName === 'askAssistant';
    let googleOperation = info.fieldName === 'googleLogin';
    for (const node of [
      info.operation,
      ...Object.values(info.fragments ?? {}),
    ]) {
      if (node)
        visit(node, {
          Field: (field) => {
            if (field.name.value === 'askAssistant') assistantOperation = true;
            if (field.name.value === 'googleLogin') googleOperation = true;
          },
        });
    }
    const category = googleOperation
      ? 'AUTH'
      : assistantOperation
        ? 'ASSISTANT'
        : 'GRAPHQL';
    // Bodies and results can contain credentials, including aliased token fields.
    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.log(
            `${info.fieldName} success ${Date.now() - started}ms`,
            category,
          ),
        error: () =>
          this.logger.log(
            `${info.fieldName} error ${Date.now() - started}ms`,
            category,
          ),
      }),
    );
  }
}
