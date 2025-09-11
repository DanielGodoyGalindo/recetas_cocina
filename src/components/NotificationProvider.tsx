import { useState } from "react";
import { NotificationContext } from "./Contexts";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    type Notification = {
        message: string;
        type: "success" | "error" | "info";
    };

    const [notification, setNotification] = useState<Notification | null>(null);

    const alert = (message: string, type: "success" | "error" | "info" = "info") => {
        setNotification({ message, type } as Notification);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <NotificationContext.Provider value={{ notification, alert }}>
            {children}
        </NotificationContext.Provider>
    );
};