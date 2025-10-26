import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline?: string;
  profilePicUrl?: string;
  city?: string;
  country?: string;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      user: null,
      isAuthenticated: false,
      
      login: (token, userId, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        set({ token, userId, user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        set({ token: null, userId: null, user: null, isAuthenticated: false });
        window.location.href = '/login';
      },
      
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
