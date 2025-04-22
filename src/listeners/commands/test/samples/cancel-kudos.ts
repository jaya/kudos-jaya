import { Recognition } from '@/entities';

const mockRecognitions: Recognition[] = [
  {
    id: 1,
    createdAt: new Date(),
    teamId: 'testTeamId',
    fromId: 'testUserId',
    fromName: 'From name 1',
    toId: 'user1',
    toName: 'To name 1',
    slackChannelId: 'channel1',
    slackMessageId: 'msg1',
    description: 'Test kudo 1',
  } as Recognition,
  {
    id: 2,
    createdAt: new Date(),
    teamId: 'testTeamId',
    fromId: 'testUserId',
    fromName: 'From name 2',
    toId: 'user2',
    toName: 'To name 2',
    slackChannelId: 'channel1',
    slackMessageId: 'msg1',
    description: 'Test kudo 2',
  } as Recognition,
  {
    id: 3,
    createdAt: new Date(),
    teamId: 'testTeamId',
    fromId: 'testUserId',
    fromName: 'From name 3',
    toId: 'user3',
    toName: 'To name 3',
    slackChannelId: 'channel1',
    slackMessageId: 'msg1',
    description: 'Test kudo 3',
  } as Recognition,
];

export { mockRecognitions };
