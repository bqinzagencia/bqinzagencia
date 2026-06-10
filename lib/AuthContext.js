// lib/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getEmpresaActiva, getEmpresasDeUsuario, cambiarEmpresaActiva, isSuperAdmin } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [empresa, setEmpresa]   = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [esAdmin, setEsAdmin]   = useState(false);
  const [loading, setLoading]   = useState(true);
  // sinEmpresa = usuario logueado pero sin empresa vinculada
  const [sinEmpresa, setSinEmpresa] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        try {
          const [emp, emps, admin] = await Promise.all([
            getEmpresaActiva(u.uid),
            getEmpresasDeUsuario(u.uid),
            isSuperAdmin(u.uid),
          ]);
          if (!emp || emps.length === 0) {
            // Usuario sin empresa — fue dado de baja o nunca completó el registro
            setSinEmpresa(true);
            setEmpresa(null);
            setEmpresas([]);
          } else {
            setSinEmpresa(false);
            setEmpresa(emp);
            setEmpresas(emps);
          }
          setEsAdmin(admin);
        } catch (e) {
          console.error('AuthContext error:', e);
          setSinEmpresa(true);
          setEmpresa(null);
          setEmpresas([]);
        }
      } else {
        setUser(null);
        setEmpresa(null);
        setEmpresas([]);
        setEsAdmin(false);
        setSinEmpresa(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const seleccionarEmpresa = async (empresaId) => {
    if (!user) return;
    await cambiarEmpresaActiva(user.uid, empresaId);
    const emp = empresas.find(e => e.id === empresaId);
    if (emp) { setEmpresa(emp); setSinEmpresa(false); }
  };

  const agregarEmpresa = (nuevaEmpresa) => {
    setEmpresas(prev => {
      const ya = prev.find(e => e.id === nuevaEmpresa.id);
      return ya ? prev : [...prev, nuevaEmpresa];
    });
    setEmpresa(nuevaEmpresa);
    setSinEmpresa(false);
  };

  return (
    <AuthContext.Provider value={{
      user, empresa, empresas, esAdmin, loading, sinEmpresa,
      setEmpresa, seleccionarEmpresa, agregarEmpresa,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
