export interface UserInfoProvider {
  getUserInfo(params: { userId: string }): Promise<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;

  getConversationInfo(params: { conversationId: string }): Promise<{
    id: string;
    name: string;
    isPrivate: boolean;
  }>;

  getUserList(): Promise<
    Array<{
      id: string;
      name: string;
      email?: string;
    }>
  >;
}
