const giftCardApiTokenHint = 'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const defaultAmountHint = 'Ex: 100.';
const defaultChannelHint =
  'Enter the default Slack channel id (ex: C93LZNJ64, #bots).';
const alreadyInstalled = false;
const companyValuesHint =
  'The company values to be selected when giving a kudo';
const monthlyKudosLimitHint =
  'Leave empty for unlimited. Ex: 5 (users can give at most 5 kudos per month).';

const user1 = {
  id: 'U123456',
  name: 'Name 1',
  email: null,
};

const user2 = {
  id: 'U654321',
  name: 'Name 2',
  email: null,
};

const users = [user1, user2];

const currentSettingsResponse = {
  giftCardApiTokenHint,
  defaultAmountHint,
  defaultChannelHint,
  alreadyInstalled,
  companyValuesHint,
  monthlyKudosLimitHint,
};

export { currentSettingsResponse, users, user1, user2, giftCardApiTokenHint };
