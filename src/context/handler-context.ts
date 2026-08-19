import { RequestContext, RequestContextData } from './RequestContext';
import { generateCorrelationId } from './correlation-id';

export function createRequestContextFromSlack(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  botToken: string,
): RequestContext {
  const teamId = body.team_id || body.team?.id || '';
  const enterpriseId = body.enterprise_id || body.enterprise?.id || null;
  const userId = body.user_id || body.user?.id || '';

  const contextData: RequestContextData = {
    teamId,
    enterpriseId,
    userId,
    botToken,
    correlationId: generateCorrelationId(),
  };

  if (!teamId) {
    throw new Error(
      `Missing teamId in Slack context. body keys: ${Object.keys(body).join(', ')}`,
    );
  }

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
