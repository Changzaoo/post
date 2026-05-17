export type Platform = 'tiktok' | 'instagram' | 'x' | 'telegram' | 'discord' | 'youtube' | 'linkedin' | 'facebook';
export type UserRole = 'admin' | 'editor' | 'creator' | 'viewer';
export type UserStatus = 'active' | 'disabled';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'under_review' | 'rejected' | 'expired';
export type PostType = 'post' | 'reel' | 'story' | 'short' | 'tweet' | 'article';
export type ContentType = 'text' | 'image' | 'video' | 'carousel';
export type PublishStatus = 'pending' | 'published' | 'error' | 'mocked' | 'pending_auth' | 'needs_reconnect';

export interface UserProfile {
  uid: string;
  username: string;
  usernameLower: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastLoginAt?: Date;
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  caption?: string;
  platform: Platform[];
  type: PostType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  hashtags: string[];
  firstComment?: string;
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  adaptedContent?: AdaptedContent;
}

export interface PostMetrics {
  id?: string;
  postId: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  completionRate?: number;
  averageWatchTime?: number;
  followersGained: number;
  updatedAt: Date;
}

export interface ApiIntegration {
  id?: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  maskedKey?: string;
  lastTestAt?: Date;
  lastError?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformContent {
  text: string;
  hashtags: string[];
  warnings: string[];
  characterCount: number;
  isValid: boolean;
}

export interface AdaptedContent {
  tiktok: PlatformContent;
  instagram: PlatformContent;
  x: PlatformContent;
  telegram: PlatformContent;
  discord: PlatformContent;
  youtube?: PlatformContent;
  linkedin?: PlatformContent;
  facebook?: PlatformContent;
}

export interface PublishResult {
  [key: string]: { status: PublishStatus; message?: string; postId?: string };
}

export interface PublishedPost {
  id?: string;
  userId: string;
  baseText: string;
  adaptedContent: AdaptedContent | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  selectedPlatforms: Platform[];
  results: PublishResult;
  createdAt: Date;
}

export interface Draft {
  id?: string;
  userId: string;
  baseText: string;
  adaptedContent: AdaptedContent | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  selectedPlatforms: Platform[];
  createdAt: Date;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

// Legacy compat
export interface User {
  uid: string;
  email: string;
  createdAt: Date;
}

export interface ConnectedAccount {
  userId: string;
  platform: Platform;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  expiresAt: Date;
  platformUserId: string;
  status: 'connected' | 'expired' | 'disconnected';
}

export interface PlatformLog {
  userId: string;
  platform: Platform;
  action: string;
  status: 'success' | 'error';
  message: string;
  createdAt: Date;
}

export interface PublishResponse {
  success: boolean;
  results: PublishResult;
}
