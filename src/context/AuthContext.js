import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AuthService from '../components/Auth/authService';

// Manual/demo credentials — disabled. Login authenticates against ServiceNow.
// export const HARDCODED_USERNAME = 'rahul';
// export const HARDCODED_PASSWORD = 'password123';

const SESSION_KEY = 'uia_session';
const PASSWORD_KEY = 'uia_password';
const PROFILE_KEY = 'uia_profile';
const SETTINGS_KEY = 'uia_settings';
const USER_KEY = 'uia_user';

const defaultProfile = {
  name: '',
  username: '',
  email: '',
  phone: '',
  bio: ''
};

const defaultSettings = {
  notifications: true,
  darkMode: false,
  language: 'en',
  autoSave: true,
  twoFactor: false
};

const AuthContext = createContext(null);

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

const mapServiceNowUserToProfile = (snUser, currentProfile) => {
  const displayName = [snUser.first_name, snUser.last_name].filter(Boolean).join(' ').trim()
    || snUser.user_name
    || '';

  return {
    ...defaultProfile,
    bio: currentProfile.bio || '',
    name: displayName,
    username: snUser.user_name || '',
    email: snUser.email || '',
    phone: snUser.mobile_phone || snUser.phone || ''
  };
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(SESSION_KEY) === 'true'
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [password, setPassword] = useState(
    () => localStorage.getItem(PASSWORD_KEY) || ''
  );
  const [profile, setProfile] = useState(() => readJson(PROFILE_KEY, defaultProfile));
  const [settings, setSettings] = useState(() => readJson(SETTINGS_KEY, defaultSettings));

  useEffect(() => {
    document.body.classList.toggle('dark-mode', Boolean(settings.darkMode));
  }, [settings.darkMode]);

  const login = useCallback(async (username, submittedPassword) => {
    try {
      const result = await AuthService.authenticateUser(username, submittedPassword);

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      setUser(result.user);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));

      setProfile((current) => {
        const merged = mapServiceNowUserToProfile(result.user, current);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
        return merged;
      });

      localStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);

      return { ok: true, message: result.message };
    } catch {
      return { ok: false, message: 'Login failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback((nextProfile) => {
    setProfile((current) => {
      const merged = { ...current, ...nextProfile };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const updateSettings = useCallback((nextSettings) => {
    setSettings((current) => {
      const merged = { ...current, ...nextSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const changePassword = useCallback((currentPassword, newPassword) => {
    if (currentPassword !== password) {
      return { ok: false, message: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, message: 'New password must be at least 6 characters.' };
    }
    setPassword(newPassword);
    localStorage.setItem(PASSWORD_KEY, newPassword);
    return { ok: true, message: 'Password updated. Use the new password next time you log in.' };
  }, [password]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      profile,
      settings,
      login,
      logout,
      updateProfile,
      updateSettings,
      changePassword
    }),
    [user, isAuthenticated, profile, settings, login, logout, updateProfile, updateSettings, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
