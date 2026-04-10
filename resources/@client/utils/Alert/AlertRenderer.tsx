import React from "react";
import { CheckCircle, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { AlertState } from "./AlertContext";

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="text-green-500" />,
  error: <XCircle className="text-red-500" />,
  warning: <AlertTriangle className="text-yellow-500" />,
  info: <Info className="text-blue-500" />,
};

interface AlertRendererProps {
  alert: AlertState;
  onClose: () => void;
}

const AlertRenderer: React.FC<AlertRendererProps> = ({
  alert,
  onClose,
}) => {
  // Toast styles - Change z-50 to z-[9999]
  if (["success", "error", "warning", "info"].includes(alert.type)) {
    return (
      <div className="fixed top-5 right-5 bg-white shadow-lg rounded-lg p-4 w-[350px] flex gap-3 z-[9999]"> {/* ✅ Changed from z-50 to z-[9999] */}
        {icons[alert.type]}
        <div className="flex-1">
          <h4 className="font-semibold">{alert.title}</h4>
          <p className="text-sm text-gray-500">{alert.message}</p>
        </div>
        <button onClick={onClose} className="cursor-pointer">
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    );
  }

  // Modal styles - Change z-50 to z-[9999] as well
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] p-4"> {/* ✅ Changed from z-50 to z-[9999] */}
      <div className="bg-white rounded-lg p-6 w-full max-w-[400px] relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer">
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>

        <h3 className="font-semibold text-lg">{alert.title}</h3>
        <p className="text-sm text-gray-500 mt-2">{alert.message}</p>

        {alert.type === "confirm" && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert.onConfirm?.();
                onClose();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer font-medium"
            >
              Confirm
            </button>
          </div>
        )}

        {alert.type === "subscribe" && (
          <div className="mt-5">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border border-gray-200 px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
            <button className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition-colors cursor-pointer font-medium">
              Yeah, thanks!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertRenderer;