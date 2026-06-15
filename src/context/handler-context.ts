import { RequestContext, RequestContextData } from './RequestContext';
import { generateCorrelationId } from './correlation-id';

export function createRequestContextFromSlack(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  botToken: string,
): RequestContext {
  const contextData: RequestContextData = {
    teamId: body.team_id || '',
    enterpriseId: body.enterprise_id || null,
    userId: body.user_id || '',
    botToken,
    correlationId: generateCorrelationId(),
  };

  return new RequestContext(contextData);
}

export function withRequestContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (args: any) => Promise<void>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (args: any) => Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (args: any) => {
    const { body, context } = args;
    const requestContext = createRequestContextFromSlack(
      body,
      context.botToken,
    );

    return RequestContext.runAsync(requestContext, () => handler(args));
  };
}
