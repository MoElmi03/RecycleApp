import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Consistent field names used everywhere in the app
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name: email.split('@')[0],
    email,
    photoURL: '',
    totalPoints: 0,
    weeklyPoints: 0,
    currentStreak: 0,
    level: 1,
    completedChallenges: [],   // array of challenge IDs completed this week
    lastWeekReset: serverTimestamp(),
    joinDate: serverTimestamp(),
  });

  return userCredential;
}

export function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}
