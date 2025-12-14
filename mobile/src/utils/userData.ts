export type User = {
  id: number;
  username: string;
  profile_picture: string;
  online: boolean;
  isFriend : boolean;
  requestPending : boolean;
  last_active : Date;
};
export interface FriendRequest {
  id: number;
  username: string;
  profile_picture: string;
  status: string;
  created_at: string;
}
