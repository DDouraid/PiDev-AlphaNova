export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface Message {
  id?: number;
  content: string;
  userId?: number;       // Added to match backend (set by server)
  username?: string;     // Added to match backend (set by server)
  senderId?: number;     // Keep for compatibility
  receiverId?: number | null;
  groupId?: number | null;
  group?: {
    id: number;
    name: string;
  };
  attachment?: string | null;
  status: MessageStatus;
  createdAt?: string;
  updatedAt?: string;
}
