import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser, isEmailTaken, isUsernameTaken } from '../database/db';

// ─── Validation helpers ───────────────────────────────────────────────────────

export const PASSWORD_RULES = [
  { id: 'length',    label: 'Au moins 8 caractères',          test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'Une lettre majuscule (A–Z)',      test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Une lettre minuscule (a–z)',      test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'Un chiffre (0–9)',                test: (p) => /[0-9]/.test(p) },
  { id: 'special',   label: 'Un caractère spécial (!@#$%...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const isPasswordValid = (password) =>
  PASSWORD_RULES.every((rule) => rule.test(password));

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Veuillez remplir tous les champs.' };
    }
    if (!validateEmail(email)) {
      return { success: false, error: 'Adresse e-mail invalide.' };
    }

    try {
      setLoading(true);
      const user = await loginUser(email, password);
      if (!user) {
        return { success: false, error: 'E-mail ou mot de passe incorrect.' };
      }
      setCurrentUser(user);
      return { success: true };
    } catch (e) {
      console.error('Erreur login:', e);
      return { success: false, error: 'Une erreur est survenue. Réessayez.' };
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (username, email, password, confirmPassword) => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return { success: false, error: 'Veuillez remplir tous les champs.' };
    }
    if (username.trim().length < 3) {
      return { success: false, error: "Le nom d'utilisateur doit contenir au moins 3 caractères." };
    }
    if (!validateEmail(email)) {
      return { success: false, error: 'Adresse e-mail invalide.' };
    }
    if (!isPasswordValid(password)) {
      return { success: false, error: 'Le mot de passe ne respecte pas les critères requis.' };
    }
    if (password !== confirmPassword) {
      return { success: false, error: 'Les mots de passe ne correspondent pas.' };
    }

    try {
      setLoading(true);
      if (await isEmailTaken(email)) {
        return { success: false, error: 'Cette adresse e-mail est déjà utilisée.' };
      }
      if (await isUsernameTaken(username)) {
        return { success: false, error: "Ce nom d'utilisateur est déjà pris." };
      }
      const newId = await registerUser(username, email, password);
      setCurrentUser({ id: newId, username: username.trim(), email: email.toLowerCase().trim() });
      return { success: true };
    } catch (e) {
      console.error('Erreur inscription:', e);
      return { success: false, error: 'Une erreur est survenue. Réessayez.' };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);