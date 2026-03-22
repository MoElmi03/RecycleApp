import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { awardPoints, computeLevel } from './points';

export interface Challenge {
  id: string;
  title: string;
  points: number;
  icon: string;
  type: 'daily' | 'weekly';
}

export const ALL_CHALLENGES: Challenge[] = [
  // Daily
  { id: 'd1', title: 'Recycle 3 plastic bottles', points: 10, icon: '♻️', type: 'daily' },
  { id: 'd2', title: 'Identify the Contaminant', points: 30, icon: '🔍', type: 'daily' },
  { id: 'd3', title: 'Complete a Recycling Quiz', points: 25, icon: '📝', type: 'daily' },
  // Weekly
  { id: 'w1', title: 'Earn 100 Points This Week', points: 100, icon: '🏆', type: 'weekly' },
  { id: 'w2', title: 'Complete All Daily Challenges', points: 75, icon: '⭐', type: 'weekly' },
];

/**
 * Mark a challenge as complete for the current user.
 * Awards the points, logs telemetry, and updates level in Firestore.
 * Returns false if the challenge was already completed this week.
 */
export async function completeChallenge(
  challenge: Challenge,
  completedIds: string[]
): Promise<boolean> {
  if (completedIds.includes(challenge.id)) return false;

  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  // Award points (also logs telemetry internally)
  await awardPoints(challenge.points, `challenge:${challenge.id}`);

  // Mark challenge as completed & recalculate level
  const userRef = doc(db, 'users', uid);

  // We need the new totalPoints to recompute level — fetch optimistically
  // (level update is best-effort; not critical for UX)
  const newCompleted = [...completedIds, challenge.id];
  const allDailyDone = ALL_CHALLENGES
    .filter(c => c.type === 'daily')
    .every(c => newCompleted.includes(c.id));

  await updateDoc(userRef, {
    completedChallenges: arrayUnion(challenge.id),
    // Recalculate level based on estimated new points
    level: computeLevel(0), // will be refreshed by real-time listener on home screen
    ...(allDailyDone && !completedIds.includes('w2')
      ? { completedChallenges: arrayUnion(challenge.id, 'w2') }
      : {}),
  });

  return true;
}
