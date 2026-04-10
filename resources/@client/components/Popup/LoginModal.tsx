import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./ForgotPasswordModal";
import EmailVerificationModal from "./EmailVerificationModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { Alert } from "@/utils/Alert/Alert";
import auth from "@/services/AuthService"; 
import { useAppDispatch } from "@/stores/hooks"; 
import { fetchUserProfile } from "@/stores/slices/authSlice";

interface LoginFormData {
    email: string;
    password: string;
    platform: "web" | "app";
}

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    SwitchToRegister: () => void;
}

interface LoginResponse {
    status: string;
    code: number;
    message: string;
    data: {
        platform: string;
        access_token: string;
        refresh_token: string;
        expires_in: number;
    };
}

// Validation schema for login
const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format")
        .max(255, "Email must not exceed 255 characters"),

    password: Yup.string().required("Password is required"),

    platform: Yup.string()
        .oneOf(["web", "app"], "Invalid platform")
        .required("Platform is required"),
});

export default function LoginModal({
    isOpen,
    onClose,
    SwitchToRegister,
}: LoginModalProps) {
    const navigate = useNavigate();
     const dispatch = useAppDispatch();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>(
        {},
    );

    // State for Reset Password Modal
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Account lock state
    const [globalError, setGlobalError] = useState<string>("");

    const formik = useFormik<LoginFormData>({
        initialValues: {
            email: "",
            password: "",
            platform: "web",
        },
        validationSchema: LoginSchema,
        validateOnChange: true,
        validateOnBlur: true,
        validateOnMount: false,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            setServerErrors({});
            setGlobalError("");
            setIsSubmitting(true);

            try {
                // Use centralized auth service - client token is automatically added by interceptor
                const response = await auth.post<LoginResponse>(
                    "/auth/login",
                    values,
                );

                console.log("Login successful:", response.data);
                localStorage.setItem(
                    "access_token",
                    response.data.data.access_token,
                );
                localStorage.setItem(
                    "refresh_token",
                    response.data.data.refresh_token,
                );
                // Fetch user profile immediately after login
                
              (async () => {
                  try {
                      await dispatch(fetchUserProfile()).unwrap();
                      console.log("Profile fetched");
                  } catch (error) {
                      console.error("Profile fetch failed:", error);
                  }
              })();

                // Redirect to dashboard
                navigate("/dashboard");
            } catch (error: any) {
                if (
                    error.response?.status === 422 &&
                    error.response?.data?.errors
                ) {
                    // Handle validation errors from backend
                    const backendErrors = error.response.data.errors;
                    setServerErrors(backendErrors);

                    // Map backend errors to Formik field errors
                    const formikErrors: Record<string, string> = {};
                    Object.keys(backendErrors).forEach((field) => {
                        if (backendErrors[field].length > 0) {
                            formikErrors[field] = backendErrors[field][0];
                        }
                    });
                    setErrors(formikErrors);
                } else if (error.response?.status === 401) {
                    const remainingAttempts =
                        error.response?.data?.remaining_attempts ??
                        error.response?.data?.data?.attempts_left;

                    if (remainingAttempts !== undefined) {
                        setGlobalError(
                            `Invalid credentials. You have ${remainingAttempts} attempt(s) left.`,
                        );
                    } else {
                        setGlobalError(
                            "Invalid credentials. Please check your email and password.",
                        );
                    }
                } else if (
                    error.response?.status === 403 &&
                    error.response?.data?.code === 1004 // Account locked code
                ) {
                    // Account locked - show 24 hours lock message
                    setGlobalError(
                        error.response?.data?.message ||
                            "Your account has been locked due to multiple failed login attempts. Please try again after 24 hours.",
                    );
                } else if (
                    error.response?.status === 403 &&
                    error.response?.data?.code === 1026
                ) {
                    // Email not verified - open verification modal
                    console.log("Email not verified:", error.response.data);
                    const unverifiedEmail =
                        error.response.data.data?.email || values.email;
                    // Store OTP expiry if provided
                    if (error.response.data.data?.expires_at) {
                        const expiryValue = Number(
                            error.response.data.data.expires_at,
                        );
                        localStorage.setItem(
                            "otp_expiry_at",
                            (expiryValue * 1000).toString(),
                        );
                        localStorage.setItem("user_email", unverifiedEmail);

                        console.log("OTP Expiry stored:", {
                            timestamp: expiryValue,
                            date: new Date(
                                Number(expiryValue) * 1000,
                            ).toLocaleString(),
                        });
                    }

                    setUnverifiedEmail(unverifiedEmail);
                    setShowEmailVerification(true);
                } else if (
                    error.response?.status === 403 &&
                    error.response?.data?.code === 1401
                ) {
                    // Temporary password - open change password modal
                    console.log("Temporary password:", error.response.data);
                    setResetEmail(values.email);
                    setShowResetPassword(true);
                } else {
                    console.error("Login failed:", error);
                    Alert.Error(
                        error.response?.data?.message ||
                            "Login failed. Please try again.",
                    );
                }
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    // Simplified useEffect - only reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            formik.resetForm();
            setServerErrors({});
             setGlobalError("");
            setShowPassword(false);
             setIsSubmitting(false);
        }
    }, [isOpen]);

    // Handle Sign Up click
    const handleSignUpClick = () => {
        onClose();
        setTimeout(() => {
            SwitchToRegister();
        }, 300);
    };

    const handleVerificationSuccess = () => {
        console.log("Email verified successfully");
        setShowEmailVerification(false);
        Alert.Success("Email verified successfully! You can now login.");
    };

    const handleVerificationClose = () => {
        setShowEmailVerification(false);
    };

    // Helper function to get error message
    const getErrorMessage = (
        fieldName: keyof LoginFormData,
    ): string | undefined => {
        // Show error if field has been touched OR if form has been submitted
        if (
            (formik.touched[fieldName] || formik.submitCount > 0) &&
            formik.errors[fieldName]
        ) {
            return formik.errors[fieldName];
        }
        if (serverErrors[fieldName] && serverErrors[fieldName].length > 0) {
            return serverErrors[fieldName][0];
        }
        return undefined;
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl w-11/12 max-w-4xl flex overflow-hidden"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                transition: { duration: 0.3, ease: "easeOut" },
                            }}
                            exit={{
                                scale: 0.8,
                                opacity: 0,
                                transition: { duration: 0.2, ease: "easeIn" },
                            }}
                        >
                            {/* Left Image */}
                            <div className="hidden md:block md:w-1/2">
                                <img
                                    src="https://csmsjc.in/wp-content/uploads/2025/01/3783954.webp"
                                    alt="Login"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Right Login Form */}
                            <div className="w-full md:w-1/2 p-8 relative">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X size={24} />
                                </button>

                                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                    Welcome Back
                                </h2>
                                <p className="text-gray-500 mb-6">
                                    Log in to access your account
                                </p>

                                <form
                                    onSubmit={formik.handleSubmit}
                                    className="space-y-4"
                                >
                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="you@example.com"
                                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand focus:outline-none ${
                                                getErrorMessage("email")
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {getErrorMessage("email") && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {getErrorMessage("email")}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field with Eye Toggle */}
                                    <div>
                                        <label className="block text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={formik.values.password}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Enter your password"
                                                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand focus:outline-none pr-10 ${
                                                    getErrorMessage("password")
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={20} />
                                                ) : (
                                                    <Eye size={20} />
                                                )}
                                            </button>
                                        </div>
                                        {getErrorMessage("password") && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {getErrorMessage("password")}
                                            </p>
                                        )}
                                    </div>

                                    {/* Forgot Password Link */}
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                setTimeout(() => {
                                                    setShowForgotPassword(true);
                                                }, 300);
                                            }}
                                            className="text-sm text-brand hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    {globalError && (
                                        <div className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm mt-2">
                                            {globalError}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full bg-brand text-white py-2 rounded-lg hover:bg-brand-dark transition ${
                                            isSubmitting
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        {isSubmitting
                                            ? "Logging in..."
                                            : "Log In"}
                                    </button>
                                </form>

                                {/* Sign Up Link */}
                                <p className="mt-6 text-center text-gray-500 text-sm">
                                    Don't have an account?{" "}
                                    <span
                                        className="text-brand cursor-pointer"
                                        onClick={handleSignUpClick}
                                    >
                                        Sign Up
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />

            <EmailVerificationModal
                isOpen={showEmailVerification}
                onClose={handleVerificationClose}
                email={unverifiedEmail}
                onVerified={handleVerificationSuccess}
            />

            <ResetPasswordModal
                isOpen={showResetPassword}
                onClose={() => setShowResetPassword(false)}
                email={resetEmail}
                onSuccess={() => {
                    setShowResetPassword(false);
                    Alert.Success(
                        "Password changed successfully! Please login with your new password.",
                    );
                }}
            />
        </>
    );
}
