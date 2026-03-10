import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    totalPoints: 0,
    currentStreak: 0,
    joinDate: new Date()
  });

  return userCredential;
}

export function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}