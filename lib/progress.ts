import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProgress {
  completedChallenges: never[];
  completedLessons: string[];   // lesson part IDs
  completedQuizzes: string[];   // quiz part IDs
  quizScores: Record<string, number>; // quizId -> best score (0-100)
  totalPoints: number;
  weeklyPoints: number;
  level: number;
  currentStreak: number;
}

const LESSON_POINTS = 20;
const QUIZ_POINTS   = 30;
const PERFECT_BONUS = 10;

function computeLevel(pts: number): number {
  return Math.floor(pts / 200) + 1;
}

export async function getUserProgress(): Promise<UserProgress | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    completedChallenges: d.completedChallenges ?? [],
    completedLessons: d.completedLessons ?? [],
    completedQuizzes: d.completedQuizzes ?? [],
    quizScores:       d.quizScores       ?? {},
    totalPoints:      d.totalPoints      ?? 0,
    weeklyPoints:     d.weeklyPoints     ?? 0,
    level:            d.level            ?? 1,
    currentStreak:    d.currentStreak    ?? 0,
  };
}

export async function markLessonComplete(lessonId: string): Promise<{ pointsEarned: number; alreadyDone: boolean }> {
  const user = auth.currentUser;
  if (!user) return { pointsEarned: 0, alreadyDone: false };

  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const data = snap.data() ?? {};
  const completed: string[] = data.completedLessons ?? [];

  if (completed.includes(lessonId)) return { pointsEarned: 0, alreadyDone: true };

  const newCompleted = [...completed, lessonId];
  const newTotal     = (data.totalPoints ?? 0) + LESSON_POINTS;

  await updateDoc(ref, {
    completedLessons: newCompleted,
    totalPoints:      increment(LESSON_POINTS),
    weeklyPoints:     increment(LESSON_POINTS),
    level:            computeLevel(newTotal),
  });

  // Telemetry
  await setDoc(doc(db, 'users', user.uid, 'telemetry', `lesson_${lessonId}_${Date.now()}`), {
    type: 'lesson_complete', lessonId, points: LESSON_POINTS, ts: new Date().toISOString(),
  });

  return { pointsEarned: LESSON_POINTS, alreadyDone: false };
}

export async function markQuizComplete(
  quizId: string,
  score: number,     // 0–100
  correct: number,
  total: number,
): Promise<{ pointsEarned: number; alreadyDone: boolean; newBest: boolean }> {
  const user = auth.currentUser;
  if (!user) return { pointsEarned: 0, alreadyDone: false, newBest: false };

  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const data = snap.data() ?? {};

  const completedQuizzes: string[]           = data.completedQuizzes ?? [];
  const quizScores: Record<string, number>   = data.quizScores       ?? {};

  const prevBest   = quizScores[quizId] ?? -1;
  const isPerfect  = score === 100;
  const isNewBest  = score > prevBest;
  const firstTime  = !completedQuizzes.includes(quizId);

  let pts = 0;
  if (firstTime)  pts += QUIZ_POINTS;
  if (isPerfect && prevBest < 100) pts += PERFECT_BONUS;

  const updates: Record<string, any> = {
    [`quizScores.${quizId}`]: Math.max(score, prevBest),
  };

  if (firstTime) {
    updates.completedQuizzes = [...completedQuizzes, quizId];
  }

  if (pts > 0) {
    const newTotal = (data.totalPoints ?? 0) + pts;
    updates.totalPoints  = increment(pts);
    updates.weeklyPoints = increment(pts);
    updates.level        = computeLevel(newTotal);
  }

  await updateDoc(ref, updates);

  await setDoc(doc(db, 'users', user.uid, 'telemetry', `quiz_${quizId}_${Date.now()}`), {
    type: 'quiz_complete', quizId, score, correct, total, points: pts, ts: new Date().toISOString(),
  });

  return { pointsEarned: pts, alreadyDone: !firstTime, newBest: isNewBest };
}

// Check if all lessons/quizzes in a chapter are complete
export function chapterLessonsDone(completedLessons: string[], chapterId: string, partCount = 3): boolean {
  for (let i = 1; i <= partCount; i++) {
    if (!completedLessons.includes(`${chapterId}-0${i}`)) return false;
  }
  return true;
}

export function chapterQuizzesDone(completedQuizzes: string[], chapterId: string, partCount = 3): boolean {
  for (let i = 1; i <= partCount; i++) {
    if (!completedQuizzes.includes(`${chapterId}-0${i}`)) return false;
  }
  return true;
}

// Challenge integration: check if any "complete X lessons/quizzes" challenge is newly finished
export async function checkChallengesAfterProgress(): Promise<string[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const snap   = await getDoc(doc(db, 'users', user.uid));
  const data   = snap.data() ?? {};
  const done   = new Set<string>(data.completedChallenges ?? []);
  const lessons = (data.completedLessons  ?? []).length;
  const quizzes = (data.completedQuizzes  ?? []).length;

  const nowComplete: string[] = [];

  const milestone = (id: string, condition: boolean) => {
    if (condition && !done.has(id)) nowComplete.push(id);
  };

  milestone('first_lesson',       lessons >= 1);
  milestone('five_lessons',        lessons >= 5);
  milestone('ten_lessons',         lessons >= 10);
  milestone('first_quiz',          quizzes >= 1);
  milestone('five_quizzes',        quizzes >= 5);
  milestone('ten_quizzes',         quizzes >= 10);

  if (nowComplete.length > 0) {
    const newDone = [...done, ...nowComplete];
    await updateDoc(doc(db, 'users', user.uid), { completedChallenges: newDone });
  }

  return nowComplete;
}