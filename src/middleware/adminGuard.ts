import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function adminGuard(req: NextRequest) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return NextResponse.redirect('/login');
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data().role !== 'admin') {
    return NextResponse.redirect('/(tabs)');
  }
  return NextResponse.next();
}
