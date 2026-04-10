import React, { createContext, useContext, useState } from "react";
import AlertRenderer from "./AlertRenderer";

type AlertType =
    | "success"
    | "error"
    | "warning"
    | "info"
    | "confirm"
    | "subscribe";

export interface AlertState {
    type: AlertType;
    title?: string;
    message?: string;
    onConfirm?: () => void;
}

interface AlertContextProps {
    show: (alert: AlertState) => void;
    hide: () => void;
}

const AlertContext = createContext<AlertContextProps | null>(null);

export const useAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error("useAlert must be used inside provider");
    return ctx;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [alert, setAlert] = useState<AlertState | null>(null);

    const show = (data: AlertState) => {
        setAlert(data);

        if (data.type !== "confirm") {
            setTimeout(() => {
                setAlert(null);
            }, 3000);
        }
    };
    const hide = () => setAlert(null);

    return (
        <AlertContext.Provider value={{ show, hide }}>
            {children}
            {alert && <AlertRenderer alert={alert} onClose={hide} />}
        </AlertContext.Provider>
    );
};
