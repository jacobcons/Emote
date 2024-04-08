export const TABLES = {
  USER: 'user',
  FRIENDSHIP: 'friendship',
  FRIEND_REQUEST: 'friend_request',
  POST: 'post',
  COMMENT: 'comment',
  REACTION: 'reaction',
};

export const FRIENDSHIP_STATUS = {
  NO_REQUEST: 'NO_REQUEST',
  REQUEST_SENT: 'REQUEST_SENT',
  REQUEST_RECEIVED: 'REQUEST_RECEIVED',
  FRIENDS: 'FRIENDS',
};

export const MAX_UPLOAD_SIZE_MB = 5;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
