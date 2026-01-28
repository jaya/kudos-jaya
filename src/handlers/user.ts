import { RecognitionController } from '@/controllers';
import { authenticateApiKey } from '@/utils/authMiddleware';
import { getQueryParams, sendJsonResponse } from '@/utils/http-utils';
import logger from '@/utils/logger';
import { ParamsIncomingMessage } from '@slack/bolt/dist/receivers/ParamsIncomingMessage';
import { UsersLookupByEmailResponse, WebClient } from '@slack/web-api';
import { ServerResponse } from 'node:http';

export async function userHandler(
  req: ParamsIncomingMessage,
  res: ServerResponse,
) {
  const { email } = req.params;

  const { page, pageSize } = getQueryParams(req.url);

  try {
    const clientInfo = await authenticateApiKey(req);

    if (!clientInfo?.teamId) {
      return sendJsonResponse(res, 401, {
        error: 'Unauthorized: Invalid API Key',
      });
    }

    const { bot, teamId } = clientInfo;
    const client = new WebClient(bot.token);

    let response: UsersLookupByEmailResponse;
    try {
      response = await client.users.lookupByEmail({
        email: Array.isArray(email) ? email[0] : email,
      });
    } catch (error) {
      logger.error(error);
      return sendJsonResponse(res, 404, {
        message: 'No kudos found with provided params',
      });
    }

    const { id: userId } = response.user;

    const kudos = await new RecognitionController().findWithPagination({
      teamId,
      params: { toId: userId },
      page,
      pageSize,
    });

    if (!kudos || kudos.data.length === 0) {
      return sendJsonResponse(res, 404, {
        message: 'No kudos found with provided params',
      });
    }

    sendJsonResponse(res, 200, kudos);
  } catch (error) {
    logger.error('Error while fetching user kudos at userHandler()', error);
    return sendJsonResponse(res, 500, { message: 'Internal Server Error' });
  }
}
