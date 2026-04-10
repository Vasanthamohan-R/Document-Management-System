import React, { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function AuthModals() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <>
            {/* Example Buttons */}
            <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Open Login
            </button>

            <button
                onClick={() => setShowRegister(true)}
                className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
                Open Register
            </button>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                SwitchToRegister={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                }}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
                SwitchToLogin={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                }}
            />
        </>
    );
}