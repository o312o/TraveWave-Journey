import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp,
  collection,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db, testFirestoreConnection } from '../lib/firebase';
import { Trade } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  trades: Trade[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Ensure user profile exists
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, {
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Subscribe to trades
        const tradesRef = collection(db, 'users', user.uid, 'trades');
        const q = query(tradesRef, orderBy('timestamp', 'desc'));
        
        const unsubscribeTrades = onSnapshot(q, (snapshot) => {
          const tradeData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Trade));
          setTrades(tradeData);
        });

        return () => unsubscribeTrades();
      } else {
        setTrades([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, trades, login, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
