import React from "react";

type NotificationProps = {
    message: string;
    type: "success" | "error" | "info";
};

const Notification: React.FC<NotificationProps> = ({ message, type = "info" }) => {
    if (!message) return null;

    return (
        <div className={`notification ${type}`}>{message}</div>
    );
};

export default Notification;