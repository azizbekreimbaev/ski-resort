// Only public identity belongs in chat; never expose the authentication profile.
export interface ChatMember {
  _id: string;
  memberNick: string;
  memberImage: string;
}

export interface ChatMessage {
  event: 'message';
  id: string;
  createdAt: string;
  text: string;
  memberData: ChatMember | null;
}
