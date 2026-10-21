import crypto from 'crypto';

export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface UserRewardProfile {
  userId: string;
  totalXp: number;
  tier: UserTier;
}

const TIER_THRESHOLDS: Record<UserTier, number> = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 20000,
};

const MULTIPLIERS: Record<UserTier, number> = {
  BRONZE: 1.0,
  SILVER: 1.2,
  GOLD: 1.5,
  PLATINUM: 2.0,
};

// In-memory profile and event store for sandbox testing
const userProfiles = new Map<string, UserRewardProfile>();
const processedEventKeys = new Set<string>();

export function getProfile(userId: string): UserRewardProfile {
  if (!userProfiles.has(userId)) {
    userProfiles.set(userId, { userId, totalXp: 0, tier: 'BRONZE' });
  }
  return userProfiles.get(userId)!;
}

function calculateTier(xp: number): UserTier {
  if (xp >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (xp >= TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (xp >= TIER_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

export async function awardTransactionXp(params: {
  idempotencyKey: string;
  userId: string;
  transactionAmount: number; // Stored in UGX / Cents
}) {
  const { idempotencyKey, userId, transactionAmount } = params;

  if (processedEventKeys.has(idempotencyKey)) {
    throw new Error(`Reward idempotency conflict: Event with key '${idempotencyKey}' already processed.`);
  }

  const profile = getProfile(userId);
  const multiplier = MULTIPLIERS[profile.tier];
  
  // Standard earn rate: 1 base XP per 1,000 UGX spent * Tier Multiplier
  const basePoints = Math.floor(transactionAmount / 1000);
  const earnedXp = Math.floor(basePoints * multiplier);

  profile.totalXp += earnedXp;
  const newTier = calculateTier(profile.totalXp);
  const tierUpgraded = newTier !== profile.tier;
  profile.tier = newTier;

  processedEventKeys.add(idempotencyKey);

  return {
    userId,
    earnedXp,
    totalXp: profile.totalXp,
    tier: profile.tier,
    tierUpgraded,
  };
}
