/**
 * Overdawn Backend API Types
 *
 * This file contains all TypeScript interfaces for API requests and responses.
 * Used by both Web and Unreal clients.
 *
 * Last updated: 2026-01-14
 */

// =============================================================================
// COMMON / SHARED TYPES
// =============================================================================

/** Client type identifier */
export type ClientType = "web" | "unreal" | "offline";

/** Game session type */
export type GameType = "matchmaking" | "custom";

/** Party privacy setting */
export type PartyPrivacy = "public" | "friends" | "private";

/** User presence status */
export type PresenceStatus =
  | "online"
  | "offline"
  | "in-game"
  | "in-lobby"
  | "in-menu"
  | "In Party"
  | "Matchmaking";

/** Matchmaking ticket status from GameLift */
export type MatchmakingStatus =
  | "QUEUED"
  | "SEARCHING"
  | "PLACING"
  | "COMPLETED"
  | "FAILED"
  | "TIMED_OUT"
  | "CANCELLED"
  | "REQUIRES_ACCEPTANCE";

// =============================================================================
// USER TYPES
// =============================================================================

/** Base user document stored in MongoDB */
export interface User {
  _id: string; // Firebase UID
  email: string;
  username?: string | null;
  inviteCode?: string; // Unique code for invite links
  visibleId?: string; // ODID for public identification
  rank: number;
  coins: number;
  avatarId: string;
  bannerId: string;
  equippedTitle: string;
  partyId?: string;

  // Presence fields
  status?: PresenceStatus;
  lastSeen?: Date;
  lastSeenWeb?: Date;
  lastSeenUnreal?: Date;

  // Current game session (set via heartbeat)
  currentGame?: CurrentGameInfo;

  // Latency data for matchmaking
  latestLatencyMap?: Record<string, number>;
  latestLatencyMapUpdatedAt?: Date;

  // Social
  friends?: FriendEntry[];
  friendRequests?: FriendRequestEntry[];
  blocked?: BlockedEntry[];
  partyInvites?: PartyInvite[];

  created_at: Date;
  updated_at: Date;
}

/** Current game session info (stored on user document) */
export interface CurrentGameInfo {
  sessionId: string; // EOS session ID or AWS GameSession ID
  type: GameType;
  isHost: boolean;
  joinedAt: Date;
}

/** Public user info (safe to expose without auth) */
export interface PublicUserInfo {
  _id: string;
  username: string;
  rank: number;
  avatarId: string;
  bannerId: string;
  equippedTitle: string;
  latestLatencyMap?: Record<string, number>;
  latestLatencyMapUpdatedAt?: Date;
}

// =============================================================================
// FRIEND TYPES
// =============================================================================

/** Friend entry stored in user's friends array */
export interface FriendEntry {
  uid: string;
  username: string;
  addedAt: Date;
}

/** Friend request entry */
export interface FriendRequestEntry {
  uid: string;
  username: string;
  sentAt: Date;
}

/** Blocked user entry */
export interface BlockedEntry {
  uid: string;
  username: string;
  blockedAt: Date;
}

/** Hydrated friend info returned by /api/friends/list */
export interface HydratedFriend {
  uid: string;
  username: string;
  avatarId: string;
  bannerId: string;
  rank: number;
  equippedTitle: string;
  status: PresenceStatus;
  client: ClientType;
  isOnline: boolean;
  party: FriendPartyInfo | null;
  isPartyLeader: boolean;
  currentGame: GameSessionInfo | null; // Only if friend is hosting
  addedAt: Date;
}

/** Friend's party info */
export interface FriendPartyInfo {
  id: string;
  privacy: PartyPrivacy;
  isFull: boolean;
}

/** Game session info (used for party auto-join and "Join Friend's Game") */
export interface GameSessionInfo {
  sessionId: string;
  type: GameType;
  startedAt?: Date; // Present when from party leader
}

/** Hydrated friend request info */
export interface HydratedFriendRequest {
  uid: string;
  username: string;
  avatarId: string;
  bannerId: string;
  rank: number;
  equippedTitle: string;
  sentAt: Date;
}

// =============================================================================
// PARTY TYPES
// =============================================================================

/** Party document stored in MongoDB */
export interface Party {
  _id: string;
  leaderUid: string;
  members: PartyMember[];
  privacy: PartyPrivacy;
  region: string;
  gameMode?: string | null;
  matchmakingTicketId?: string;
  joinRequests?: PartyJoinRequest[];
  leaderGame?: GameSessionInfo; // Set when leader hosts a game
  createdAt: Date;
  updatedAt?: Date;
}

/** Party member info */
export interface PartyMember {
  uid: string;
  username: string;
  avatarId?: string;
  bannerId?: string;
  isReady: boolean;
  joinedAt: Date;
}

/** Party join request */
export interface PartyJoinRequest {
  uid: string;
  username: string;
  avatarId?: string;
  requestedAt: Date;
}

/** Party invite stored on user */
export interface PartyInvite {
  partyId: string;
  leaderUid: string;
  leaderUsername: string;
  invitedAt: Date;
}

// =============================================================================
// MATCHMAKING TYPES
// =============================================================================

/** GameLift connection info */
export interface MatchConnectionInfo {
  ipAddress: string;
  port: number;
  dnsName?: string;
  playerSessionId?: string;
}

/** Matched player session from GameLift */
export interface MatchedPlayerSession {
  PlayerId: string;
  PlayerSessionId: string;
}

// =============================================================================
// API REQUEST TYPES
// =============================================================================

/** POST /api/presence/heartbeat request */
export interface HeartbeatRequest {
  client: ClientType;
  status?: PresenceStatus;
  gameSessionId?: string | null; // null = clear game state
  gameType?: GameType;
  isHost?: boolean;
}

/** POST /api/matchmaking/queue request */
export interface MatchmakingQueueRequest {
  configName: string;
  latencyMap?: Record<string, number>;
}

/** POST /api/party/settings request */
export interface PartySettingsRequest {
  privacy?: PartyPrivacy;
  region?: string;
  gameMode?: string;
}

/** POST /api/user/profile request */
export interface ProfileUpdateRequest {
  avatarId?: string;
  bannerId?: string;
  equippedTitle?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/** POST /api/presence/heartbeat response */
export interface HeartbeatResponse {
  success: boolean;
}

/** GET /api/friends/list response */
export interface FriendsListResponse {
  friends: HydratedFriend[];
  friendRequests: HydratedFriendRequest[];
  blocked: BlockedEntry[];
}

/** GET /api/party/status response */
export interface PartyStatusResponse {
  partyId: string;
  partyInvites: PartyInvite[];
  party: Party;
  leaderGame?: GameSessionInfo; // If leader is hosting a joinable game
}

/** GET /api/matchmaking/status response */
export interface MatchmakingStatusResponse {
  status: MatchmakingStatus;
  startTime?: Date;
  estimatedWaitTime?: number;
  statusReason?: string;
  statusMessage?: string;
  gameSessionArn?: string;
  connectionInfo?: MatchConnectionInfo;
  matchedPlayers?: MatchedPlayerSession[];
}

/** POST /api/matchmaking/queue response */
export interface MatchmakingQueueResponse {
  ticketId: string;
  status: MatchmakingStatus;
  estimatedWaitTime?: number;
}

/** GET /api/user/profile response */
export interface ProfileResponse {
  user: User;
}

/** GET /api/user/public response */
export interface PublicUserResponse extends PublicUserInfo {}

/** GET /api/user/lookup response */
export interface UserLookupResponse {
  username: string;
  avatarId: string;
}

/** Generic error response */
export interface ErrorResponse {
  error: string;
}

// =============================================================================
// MATCHMAKING CONFIG TYPES
// =============================================================================

/** Matchmaking configuration info */
export interface MatchmakingConfigInfo {
  name: string;
  displayName: string;
  description?: string;
  teamSize?: number;
  minPlayers?: number;
  maxPlayers?: number;
}

/** Region info for matchmaking */
export interface RegionInfo {
  id: string;
  name: string;
  location: string;
}
