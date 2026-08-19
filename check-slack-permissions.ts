import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { DataSource } from 'typeorm';
import { User } from './src/entities/user';
import { Installation } from './src/entities/installation';
import { WebClient } from '@slack/web-api';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: ['error'],
  ssl: { rejectUnauthorized: false },
  entities: ['src/entities/*.ts'],
});

async function checkPermissions() {
  try {
    // Connect to database
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Get the team
    const userRepository = AppDataSource.getRepository(User);
    const installationRepository = AppDataSource.getRepository(Installation);

    // Find user "Mancha" - search by name
    const userMancha = await userRepository.findOne({
      where: { name: 'Mancha' },
      relations: ['installation'],
    });

    if (!userMancha) {
      console.log('❌ User "Mancha" not found');
      process.exit(1);
    }

    console.log(`✅ Found user: ${userMancha.name} (ID: ${userMancha.id})`);

    // Find "allset" team by installation
    const allsetTeam = await installationRepository.findOne({
      where: { teamName: 'allset' },
    });

    if (!allsetTeam) {
      console.log('❌ Team "allset" not found');
      process.exit(1);
    }

    console.log(`✅ Found team: ${allsetTeam.teamName} (ID: ${allsetTeam.teamId})`);

    // Get the Slack bot token
    const slackToken = allsetTeam.bot.token;
    const defaultRecognitionChannel = allsetTeam.defaultRecognitionChannel;

    if (!slackToken) {
      console.log('❌ Slack bot token not found');
      process.exit(1);
    }

    if (!defaultRecognitionChannel) {
      console.log('❌ defaultRecognitionChannel not configured');
      process.exit(1);
    }

    console.log(`✅ Slack token found`);
    console.log(`✅ Default recognition channel: ${defaultRecognitionChannel}`);

    // Initialize Slack Web API client
    const slackClient = new WebClient(slackToken);

    // Get channel info
    console.log('\n📋 Fetching channel information...');
    const channelInfo = await slackClient.conversations.info({
      channel: defaultRecognitionChannel,
    });

    if (!channelInfo.ok) {
      console.log(`❌ Failed to get channel info: ${channelInfo.error}`);
      process.exit(1);
    }

    console.log(`✅ Channel: ${channelInfo.channel?.name} (ID: ${channelInfo.channel?.id})`);
    console.log(`   - Creator: ${channelInfo.channel?.creator}`);
    console.log(`   - Created: ${new Date(
      (channelInfo.channel?.created || 0) * 1000
    ).toISOString()}`);

    // Get channel members
    console.log('\n👥 Fetching channel members...');
    const membersResponse = await slackClient.conversations.members({
      channel: defaultRecognitionChannel,
    });

    if (!membersResponse.ok) {
      console.log(`❌ Failed to get channel members: ${membersResponse.error}`);
      process.exit(1);
    }

    const isMemberInChannel = membersResponse.members?.includes(userMancha.id);
    console.log(`✅ Total members: ${membersResponse.members?.length}`);
    console.log(
      `${isMemberInChannel ? '✅' : '❌'} User "${userMancha.name}" is ${
        isMemberInChannel ? '' : 'NOT '
      }a member of the channel`
    );

    // Get user info in the workspace
    console.log('\n👤 Fetching user information...');
    const userInfo = await slackClient.users.info({
      user: userMancha.id,
    });

    if (!userInfo.ok) {
      console.log(`❌ Failed to get user info: ${userInfo.error}`);
      process.exit(1);
    }

    console.log(`✅ User: ${userInfo.user?.real_name} (@${userInfo.user?.name})`);
    console.log(`   - Is Admin: ${userInfo.user?.is_admin}`);
    console.log(`   - Is Owner: ${userInfo.user?.is_owner}`);
    console.log(`   - Is Primary Owner: ${userInfo.user?.is_primary_owner}`);

    // Check if user is channel admin
    const isChannelAdmin = channelInfo.channel?.creator === userMancha.id;
    console.log(`   - Is Channel Creator: ${isChannelAdmin}`);

    // Determine delete permission
    console.log('\n🔐 Permission Analysis:');
    const canDeleteMessages =
      userInfo.user?.is_admin ||
      userInfo.user?.is_owner ||
      userInfo.user?.is_primary_owner ||
      isChannelAdmin;

    console.log(
      `${canDeleteMessages ? '✅ YES' : '❌ NO'} - User can delete messages in this channel`
    );

    if (canDeleteMessages) {
      console.log('\n📝 Reason(s):');
      if (userInfo.user?.is_admin) console.log('  - User is a workspace admin');
      if (userInfo.user?.is_owner) console.log('  - User is a workspace owner');
      if (userInfo.user?.is_primary_owner) console.log('  - User is the primary owner');
      if (isChannelAdmin) console.log('  - User is the channel creator');
    } else {
      console.log(
        '\n⚠️  User does NOT have admin permissions to delete messages in this channel'
      );
      console.log('   Message deletion requires:');
      console.log('   - Workspace admin/owner status, OR');
      console.log('   - Channel creator status');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkPermissions();
