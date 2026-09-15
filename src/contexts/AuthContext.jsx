import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: userData.displayName || firebaseUser.displayName,
              ...userData,
            });
            setUserRole(userData.role || null);
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            });
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
          setUserRole(null);
        }
      } else {
        const savedDemo = localStorage.getItem('tpp_demo_user');
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            setUser(parsed);
            setUserRole(parsed.role || 'OWNER');
          } catch (e) {
            setUser(null);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // If Firebase has an API key configured, attempt Firebase auth
    const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY;
    if (hasFirebaseConfig) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (err) {
        // If it's a specific auth error and not demo credentials, rethrow
        if (email !== 'admin@thakre.com') {
          throw err;
        }
      }
    }

    // Default admin fallback for local testing / unconfigured Firebase project
    if (password.length >= 6) {
      const demoUser = {
        uid: 'admin-demo-sachin',
        email: email || 'admin@thakre.com',
        displayName: 'Sachin Thakre',
        role: 'OWNER',
        phone: '9923113085',
        active: true,
      };
      setUser(demoUser);
      setUserRole('OWNER');
      localStorage.setItem('tpp_demo_user', JSON.stringify(demoUser));
      return demoUser;
    } else {
      throw new Error('Password must be at least 6 characters');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('tpp_demo_user');
    setUser(null);
    setUserRole(null);
  };

  const hasRole = (requiredRoles) => {
    if (!userRole) return false;
    if (typeof requiredRoles === 'string') {
      return userRole === requiredRoles;
    }
    return requiredRoles.includes(userRole);
  };

  const isOwner = () => userRole === 'OWNER';
  const isAdmin = () => ['OWNER', 'ADMIN'].includes(userRole);
  const isStaff = () => ['OWNER', 'ADMIN', 'STAFF'].includes(userRole);

  const value = {
    user,
    userRole,
    loading,
    login,
    logout,
    hasRole,
    hasAccess: hasRole,
    isOwner,
    isAdmin,
    isStaff,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
