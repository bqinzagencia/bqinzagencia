// lib/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getEmpresaActiva, getEmpresasDeUsuario, cambiarEmpresaActiva, isSuperAdmin } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [empresa, setEmpresa]   = useState(null);
  const [empresas, setEmpresas] = useState([]); // todas las empresas del usuario
  const [esAdmin, setEsAdmin]   = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        const [emp, emps, admin] = await Promise.all([
          getEmpresaActiva(u.uid),
          getEmpresasDeUsuario(u.uid),
          isSuperAdmin(u.uid),
        ]);
        setEmpresa(emp);
        setEmpresas(emps);
        setEsAdmin(admin);
      } else {
        setUser(null);
        setEmpresa(null);
        setEmpresas([]);
        setEsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Cambiar empresa activa desde el selector
  const seleccionarEmpresa = async (empresaId) => {
    if (!user) return;
    await cambiarEmpresaActiva(user.uid, empresaId);
    const emp = empresas.find(e => e.id === empresaId);
    if (emp) setEmpresa(emp);
  };

  // Agregar empresa recién creada al contexto
  const agregarEmpresa = (nuevaEmpresa) => {
    setEmpresas(prev => [...prev, nuevaEmpresa]);
    setEmpresa(nuevaEmpresa);
  };

  return (
    <AuthContext.Provider value={{
      user, empresa, empresas, esAdmin, loading,
      setEmpresa, seleccionarEmpresa, agregarEmpresa,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
