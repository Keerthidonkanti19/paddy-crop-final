// import React, { createContext, useContext, useState, ReactNode } from 'react';

// interface User {
//   id: string;
//   username: string;
//   createdAt: Date;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (username: string) => void;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(() => {
//     const saved = localStorage.getItem('paddy_user');
//     return saved ? JSON.parse(saved) : null;
//   });

//   const login = (username: string) => {
//     const newUser: User = {
//       id: crypto.randomUUID(),
//       username,
//       createdAt: new Date(),
//     };
//     setUser(newUser);
//     localStorage.setItem('paddy_user', JSON.stringify(newUser));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('paddy_user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  mobileNumber: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, mobileNumber: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (username: string, mobileNumber: string) => {
    const userData = { username, mobileNumber };

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
