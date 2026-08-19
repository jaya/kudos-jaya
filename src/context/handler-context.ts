import { RequestContext, RequestContextData } from './RequestContext';
import { generateCorrelationId } from './correlation-id';
import { SlackAdapter } from '../adapters';
import { WebClient } from '@slack/web-api';

export function createRequestContextFromSlack(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  botToken: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slackClient?: any,
): RequestContext {
  const teamId = body.team_id || body.team?.id || body.user?.team_id || '';
  const enterpriseId = body.enterprise_id || body.enterprise?.id || null;
  const userId = body.user_id || body.user?.id || '';

  const client = slackClient || (botToken ? new WebClient(botToken) : undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = client ? new SlackAdapter(client as any) : undefined;

  const contextData: RequestContextData = {
    teamId,
    enterpriseId,
    userId,
    botToken,
    correlationId: generateCorrelationId(),
    adapter,
  };

  // Only throw error if teamId is missing in production; allow empty for tests
  if (!teamId && process.env.NODE_ENV !== 'test') {
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
    const { body, context, client } = args;
    // Use context.botToken if available, otherwise try to get it from client.token (for tests)
    const botToken = context?.botToken || client?.token || '';
    const requestContext = createRequestContextFromSlack(
      body,
      botToken,
      client,
    );

    return RequestContext.runAsync(requestContext, () => handler(args));
  };
}
