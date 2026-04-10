import React from "react";
import { useAlert } from "./AlertContext";

let alertHandler: any;

export const AlertProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const alert = useAlert();
  alertHandler = alert;
  return <>{children}</>;
};

export const Alert = {
  Success: (message: string, title = "Success") => {
    alertHandler.show({ type: "success", title, message });
  },

  Error: (message: string, title = "Error") => {
    alertHandler.show({ type: "error", title, message });
  },

  Warning: (message: string, title = "Warning") => {
    alertHandler.show({ type: "warning", title, message });
  },

  Info: (message: string, title = "Info") => {
    alertHandler.show({ type: "info", title, message });
  },

  Confirm: (message: string, onConfirm: () => void, title = "Confirm") => {
    alertHandler.show({
      type: "confirm",
      title,
      message,
      onConfirm,
    });
  },

  Subscribe: () => {
    alertHandler.show({
      type: "subscribe",
      title: "Subscribe to our Newsletter",
      message: "Join thousands getting emails in their inbox.",
    });
  },
};
