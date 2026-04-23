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
  orderBy,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db, testFirestoreConnection } from '../lib/firebase';
import { Trade } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  trades: Trade[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  seedData: () => Promise<void>;
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

  const seedData = async () => {
    if (!user) return;
    const tradesRef = collection(db, 'users', user.uid, 'trades');
    
    const sampleTrades = [
      {
        asset: 'BTCUSD',
        type: 'LONG',
        bias: 'LONG',
        conviction: 85,
        entryPrice: 62500.45,
        exitPrice: 64200.12,
        pnl: 1699.67,
        status: 'CLOSED',
        notes: 'Institutional absorption at monthly S/R. High conviction breakout.',
        timestamp: new Date(Date.now() - 86400000 * 2).getTime(),
        createdAt: serverTimestamp()
      },
      {
        asset: 'ETHUSD',
        type: 'SHORT',
        bias: 'SHORT',
        conviction: 65,
        entryPrice: 3450.20,
        exitPrice: 3320.50,
        pnl: 129.70,
        status: 'CLOSED',
        notes: 'Clean distribution pattern on H4. Expansion below liquidity void.',
        timestamp: new Date(Date.now() - 86400000).getTime(),
        createdAt: serverTimestamp()
      },
      {
        asset: 'NQZ3',
        type: 'LONG',
        bias: 'NEUTRAL',
        conviction: 45,
        entryPrice: 15420.00,
        stopLoss: 15380.00,
        takeProfit: 15600.00,
        status: 'OPEN',
        notes: 'Range expansion play. Neutral structure but localized momentum.',
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      }
    ];

    for (const trade of sampleTrades) {
      await addDoc(tradesRef, trade);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, trades, login, logout, seedData }}>
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
