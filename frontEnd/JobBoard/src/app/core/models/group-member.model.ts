export interface GroupMember {
  id?: number;  // Make id optional with ?
  group?: { id: number; name: string; createdBy: number; createdAt: string };
  userId: number;
  joinedAt: string;
  username?: string;
}
