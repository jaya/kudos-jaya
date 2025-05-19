import crypto from 'crypto';
import { InstallationController } from '../controllers';

export function generateApiKey() {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const hashedApiKey = crypto.createHash('sha256').update(apiKey).digest('hex');

  console.log(`Client API Key (give this to client): ${apiKey}`);
  console.log(`Hashed API Key (store this in your DB): ${hashedApiKey}`);
  console.log('---');
  console.log(
    'IMPORTANT: Store the HASHED key in your database, associated with the clientId.',
  );
  return { apiKey, hashedApiKey };
}

async function getClientByHashedApiKey(clientApiKey) {
  return new InstallationController().findMany({
    params: { clientApiKey },
  });
}

export async function authenticateApiKey(req) {
  const apiKey = req?.headers['x-api-key'];

  if (!apiKey) {
    return null;
  }

  const hashedIncomingKey = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');

  const installation = await getClientByHashedApiKey(hashedIncomingKey);
  if (installation.length === 0) return null;

  const { teamId, teamName, bot } = installation[0];
  return { teamId, teamName, bot };
}
