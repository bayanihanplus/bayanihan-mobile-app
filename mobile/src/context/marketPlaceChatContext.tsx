import React, { createContext,useContext,useState } from "react";

type marketNotification = {
    id: number,
    message: string,
    item?: any,
    timestamp: Date;
    read: boolean;
}

type marketNotificationContextType = {
    marketNotification : marketNotification[];
    addMarketNotification : (marketNotification: marketNotification) =>void;
    markAllRead: () => void;
}

const marketPlaceChatContext = createContext<marketNotificationContextType | undefined> (undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({children,}) => {
    const [marketNotification, setMarketNotification] = useState<marketNotification[]>([]);

    const addMarketNotification = (notifications: marketNotification) =>{
        setMarketNotification((prev) =>[notifications, ...prev]);
    };
    const markAllRead = () => {
        setMarketNotification((prev) => 
            prev.map((n) => ({
                ...n,
            }))
        );
    }

    return (
        <marketPlaceChatContext.Provider value={{marketNotification,addMarketNotification,markAllRead}}>
                {children}
        </marketPlaceChatContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(marketPlaceChatContext);
    if(!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
}