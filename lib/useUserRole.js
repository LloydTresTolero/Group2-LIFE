import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';

export function useUserRole() {
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role || 'user');
        } else {
          await setDoc(ref, {
            email: user.email,
            role: 'user',
            createdAt: new Date().toISOString(),
          });
          setRole('user');
        }
      } catch (e) {
        setRole('user');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  return { role, loading, isResponder: role === 'responder', isAdmin: role === 'admin' };
}
