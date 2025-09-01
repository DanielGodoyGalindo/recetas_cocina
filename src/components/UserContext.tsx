import React, { createContext, useState, ReactNode, useContext } from "react";

// https://react.dev/reference/react/useContext
// useContext is a React Hook that lets you read and subscribe to context from your component.
// it can be used to manage the user session

// Personal project developed by Daniel Godoy
// https://github.com/DanielGodoyGalindo

type User = {
  username: string;
  role: string;
} | null;

type UserContextType = {
  user: User;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create Provider 
// It's a wrapper to use in the app (it wraps <App> in index.js)
// used to share inside the app the user state created with useState
// now there's no need to create user states inside every component
// and passing user session props
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
};