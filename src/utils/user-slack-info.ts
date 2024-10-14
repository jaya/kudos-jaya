export async function getSlackUserInfo(client, userId: string) {
  const response = await client.users.info({ user: userId });
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.user.profile.real_name;
}
