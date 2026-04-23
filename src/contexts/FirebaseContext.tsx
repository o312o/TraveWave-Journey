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
  writeBatch,
  getDoc
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
        // Ensure user profile exists with all required fields for security rules
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || 'Vanguard Operator',
              avatarUrl: user.photoURL || null,
              initialCapital: 100000,
              currentBalance: 100000,
              peakEquity: 100000,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp()
            });
          } else {
            // Update profile info if changed
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || 'Vanguard Operator',
              avatarUrl: user.photoURL || userDocSnap.data()?.avatarUrl || null,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (error) {
          console.error("Critical: Failed to sync user profile node:", error);
        }

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
        userId: user.uid,
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
        userId: user.uid,
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
        userId: user.uid,
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
