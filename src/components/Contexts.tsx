import React, { createContext, useState, ReactNode, useContext } from "react";

// User type
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

// Notifications
type Notification = {
  message: string;
  type: "success" | "error" | "info";
};

type NotificationContextType = {
  notification: Notification | null;
  alert: (message: string, type?: "success" | "error" | "info") => void;
};

// Create contexts
const UserContext = createContext<UserContextType | undefined>(undefined);
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider to iunclude contexts
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // User state
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

  // Notifications state
  const [notification, setNotification] = useState<Notification | null>(null);

  const alert = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // desaparece en 3s
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      <NotificationContext.Provider value={{ notification, alert }}>
        {children}
        {notification && (
          <div className={`notification`}>
            {notification.message}
          </div>
        )}
      </NotificationContext.Provider>
    </UserContext.Provider>
  );
};


// Hooks to use contexts
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de <AppProvider>");
  return context;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification debe usarse dentro de <AppProvider>");
  return context;
};
