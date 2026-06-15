import {
  AllMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackViewMiddlewareArgs,
  SlackActionMiddlewareArgs,
} from '@slack/bolt';
import { RequestContext, RequestContextData } from './RequestContext';
import { generateCorrelationId } from './correlation-id';

type SlackArgs = AllMiddlewareArgs &
  (
    | SlackCommandMiddlewareArgs
    | SlackViewMiddlewareArgs
    | SlackActionMiddlewareArgs
  );

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

export function withRequestContext<T extends SlackArgs>(
  handler: (args: T) => Promise<void>,
) {
  return async (args: T) => {
    const { body, context } = args;
    const requestContext = createRequestContextFromSlack(
      body,
      context.botToken,
    );

    return RequestContext.runAsync(requestContext, () => handler(args));
  };
}
