// lib/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getEmpresa, isSuperAdmin } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        const emp = await getEmpresa(u.uid);
        setEmpresa(emp);
        const admin = await isSuperAdmin(u.uid);
        setEsAdmin(admin);
      } else {
        setUser(null);
        setEmpresa(null);
        setEsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, empresa, esAdmin, loading, setEmpresa }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
