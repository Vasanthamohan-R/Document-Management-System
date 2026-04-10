import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import EmailVerificationModal from "./EmailVerificationModal";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
    fetchCountries,
    fetchStates,
    fetchCities,
    fetchDepartments,
    clearStates,
    clearCities,
} from "@/stores/slices/locationSlice";
import { Alert } from "@/utils/Alert/Alert";

import auth from "@/services/AuthService";
import DatePicker from "react-datepicker";


// ========== INTERFACES ==========
interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    address_line_3: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    department: string;
    dob: string;
}

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    SwitchToLogin: () => void;
}

interface RegisterResponse {
    status: string;
    code: number;
    message: string;
    data: {
        expires_at?: number | string;
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    errors?: Record<string, string[]>;
}

// ========== VALIDATION SCHEMA ==========
const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .required("Full name is required")
        .max(255, "Name must not exceed 255 characters"),

    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format")
        .max(255, "Email must not exceed 255 characters"),

    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
            "Password must contain uppercase, lowercase, number, and special character",
        ),

    password_confirmation: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),

    phone: Yup.string()
        .required("Phone number is required")
        .max(20, "Phone number must not exceed 20 characters"),

    address_line_1: Yup.string()
        .required("Address line 1 is required")
        .max(255, "Address line 1 must not exceed 255 characters"),

    address_line_2: Yup.string()
        .required("Address line 2 is required")
        .max(255, "Address line 2 must not exceed 255 characters"),

    address_line_3: Yup.string()
        .required("Address line 3 is required")
        .max(255, "Address line 3 must not exceed 255 characters"),

    city: Yup.string()
        .required("City is required")
        .max(255, "City must not exceed 255 characters"),

    state: Yup.string()
        .required("State is required")
        .max(255, "State must not exceed 255 characters"),

    country: Yup.string()
        .required("Country is required")
        .max(255, "Country must not exceed 255 characters"),

    pincode: Yup.string()
        .required("Pincode is required")
        .max(255, "Pincode must not exceed 255 characters"),

    dob: Yup.date()
        .required("Date of birth is required")
        .max(
            new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
            "You must be at least 18 years old",
        )
        .typeError("Invalid date format"),

    department: Yup.string()
        .required("Department is required")
        .max(255, "Department must not exceed 255 characters"),
});

// ========== COMPONENT ==========
export default function RegisterModal({
    isOpen,
    onClose,
    SwitchToLogin,
}: RegisterModalProps) {
    // ========== STATE DECLARATIONS ==========
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedCountryId, setSelectedCountryId] = useState<string>("");

    // ========== REDUX HOOKS ==========
    const dispatch = useAppDispatch();
    const countries = useAppSelector((state) => state.location.countries);
    const allStates = useAppSelector((state) => state.location.allStates);
    const allCities = useAppSelector((state) => state.location.allCities);
    const departments = useAppSelector(
        (state) => state.location.allDepartments,
    );
    const loadingLocations = useAppSelector((state) => state.location.loading);

    // ========== LOCAL STATE FOR SELECTIONS ==========
    const [selectedStateId, setSelectedStateId] = useState<string>("");
    const [selectedDepartmentId, setSelectedDepartmentId] =
        useState<string>("");

    // Filter cities based on selected state
    const filteredCities = allCities.filter(
        (city) => city.state_id.toString() === selectedStateId,
    );

    /**
     * --------------------------------------------------------------------------------
     * Load initial data when modal opens (only once)
     * --------------------------------------------------------------------------------
     */
    useEffect(() => {
        if (isOpen) {
            if (countries.length === 0) {
                dispatch(fetchCountries());
            }
            if (allStates.length === 0) {
                dispatch(fetchStates());
            }
            if (allCities.length === 0) {
                dispatch(fetchCities());
            }
            if (departments.length === 0) {
                dispatch(fetchDepartments());
            }
        }
    }, [
        isOpen,
        dispatch,
        countries.length,
        allStates.length,
        allCities.length,
        departments.length,
    ]);

    /**
     * --------------------------------------------------------------------------------
     * Reset Local State on Modal Close
     * --------------------------------------------------------------------------------
     */
    useEffect(() => {
        if (!isOpen) {
            setSelectedCountryId("");
            setSelectedStateId("");
        }
    }, [isOpen]);

    

    /**
     * --------------------------------------------------------------------------------
     * Formik Configuration
     * --------------------------------------------------------------------------------
     */
    const formik = useFormik<RegisterFormData>({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            department: "",
            password: "",
            password_confirmation: "",
            dob: "",
            country: "",
            state: "",
            city: "",
            pincode: "",
            address_line_1: "",
            address_line_2: "",
            address_line_3: "",
        },
        validationSchema: RegisterSchema,
        validateOnChange: false,
        validateOnBlur: true,
        validateOnMount: false,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            setServerErrors({});
            setIsSubmitting(true);

            console.log("📝 Form submission started", { email: values.email });

            try {
                const selectedCity = filteredCities.find(
                    (c) => c.name === values.city,
                );

                const selectedDepartment = departments.find(
                    (d) => d.name === values.department,
                );

                console.log("🔍 Selected IDs:", {
                    countryId: selectedCountryId,
                    stateId: selectedStateId,
                    cityId: selectedCity?.id,
                    departmentId: selectedDepartment?.id,
                });

                const payload = {
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    password: values.password,
                    password_confirmation: values.password_confirmation,
                    address_line_1: values.address_line_1,
                    address_line_2: values.address_line_2,
                    address_line_3: values.address_line_3,
                    pincode: values.pincode,
                    dob: values.dob,
                    country_id: Number(selectedCountryId),
                    state_id: Number(selectedStateId),
                    city_id: selectedCity?.id,
                    department_id: selectedDepartment?.id,
                };

                console.log("📤 Sending registration request...");
                const response = await auth.post<RegisterResponse>(
                    "/auth/register",
                    payload,
                );
                console.log("✅ Registration successful:", response.data);

                if (response.data.data?.expires_at) {
                    const expiryValue = Number(response.data.data.expires_at);
                    const expiryMs = expiryValue * 1000;
                    localStorage.setItem("otp_expiry_at", expiryMs.toString());
                    localStorage.setItem("user_email", values.email);

                    console.log("📧 OTP Expiry stored:", {
                        raw: expiryValue,
                        milliseconds: expiryMs,
                        date: new Date(expiryMs).toLocaleString(),
                        timeRemaining: `${Math.floor((expiryMs - Date.now()) / 1000 / 60)} minutes`,
                    });
                } else {
                    console.warn("⚠️ No OTP expiry returned from server");
                }

                Alert.Success(
                    "Registration successful! Please check your email to verify your account.",
                );

                setRegisteredEmail(values.email);
                onClose();
                setTimeout(() => {
                    setShowEmailVerification(true);
                }, 300);
            } catch (error: any) {
                console.error("❌ Registration failed:", error);

                if (
                    error.response?.status === 422 &&
                    error.response?.data?.errors
                ) {
                    const backendErrors = error.response.data.errors;
                    setServerErrors(backendErrors);

                    console.log("📋 Validation errors:", backendErrors);

                    const formikErrors: Record<string, string> = {};
                    Object.keys(backendErrors).forEach((field) => {
                        if (backendErrors[field].length > 0) {
                            formikErrors[field] = backendErrors[field][0];
                        }
                    });
                    setErrors(formikErrors);
                } else {
                    Alert.Error(
                        error.response?.data?.message ||
                            "Registration failed. Please try again.",
                    );
                }
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    /**
     * --------------------------------------------------------------------------------
     * Reset Form on Modal Open
     * --------------------------------------------------------------------------------
     */
    useEffect(() => {
        if (isOpen) {
            formik.resetForm();
            setServerErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
            setSelectedCountryId("");
            setSelectedStateId("");
            console.log("🔄 Modal opened, form reset");
        }
    }, [isOpen]);

    /**
     * --------------------------------------------------------------------------------
     * Auto-select Malaysia as default country
     * --------------------------------------------------------------------------------
     */
    useEffect(() => {
        if (isOpen && countries.length > 0 && !selectedCountryId) {
            const malaysia = countries.find(
                (country) => country.name.toLowerCase() === "malaysia",
            );

            if (malaysia) {
                setSelectedCountryId(malaysia.id.toString());
                formik.setFieldValue("country", malaysia.name);
            }
        }
    }, [isOpen, countries, formik, selectedCountryId]);

    /**
     * --------------------------------------------------------------------------------
     * Handle Country Selection Change
     * --------------------------------------------------------------------------------
     */
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryName = e.target.value;
        const country = countries.find((c) => c.name === countryName);
        const countryId = country?.id?.toString() || "";
        setSelectedCountryId(countryId);
        setSelectedStateId("");
        formik.setFieldValue("state", "");
        formik.setFieldValue("city", "");
        formik.setFieldValue("country", countryName);

        console.log("🌍 Country changed:", { countryName, countryId });
    };

    /**
     * --------------------------------------------------------------------------------
     * Handle State Selection Change
     * --------------------------------------------------------------------------------
     */
    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateName = e.target.value;
        const state = allStates.find((s) => s.name === stateName);
        const stateId = state?.id?.toString() || "";

        setSelectedStateId(stateId);
        formik.setFieldValue("city", "");
        formik.setFieldValue("state", stateName);

        console.log("🗺️ State changed:", { stateName, stateId });
    };

    /**
     * --------------------------------------------------------------------------------
     * Handle City Selection Change
     * --------------------------------------------------------------------------------
     */
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = e.target.value;
        formik.setFieldValue("city", cityName);

        console.log("🏙️ City changed:", { cityName });
    };

    /**
     * --------------------------------------------------------------------------------
     * Handle Department Selection Change
     * --------------------------------------------------------------------------------
     */
    const handleDepartmentChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const departmentName = e.target.value;
        const department = departments.find((d) => d.name === departmentName);
        const departmentId = department?.id?.toString() || "";

        setSelectedDepartmentId(departmentId);
        formik.setFieldValue("department", departmentName);

        console.log("🏢 Department changed:", { departmentName, departmentId });
    };

    /**
     * --------------------------------------------------------------------------------
     * Close Email Verification Modal
     * --------------------------------------------------------------------------------
     */
    const handleVerificationClose = () => {
        setShowEmailVerification(false);
    };

    /**
     * --------------------------------------------------------------------------------
     * Handle Email Verification Success
     * --------------------------------------------------------------------------------
     */
    const handleVerificationSuccess = () => {
        console.log("✅ Email verified successfully");
        setShowEmailVerification(false);
        Alert.Success("Email verified successfully! You can now login.");
        SwitchToLogin();
    };

    /**
     * --------------------------------------------------------------------------------
     * Handle Sign In Click
     * --------------------------------------------------------------------------------
     */
    const handleSignInClick = () => {
        onClose();
        setTimeout(() => {
            SwitchToLogin();
        }, 300);
    };

    /**
     * --------------------------------------------------------------------------------
     * Get Error Message for Field
     * --------------------------------------------------------------------------------
     */
    const getErrorMessage = (
        fieldName: keyof RegisterFormData,
    ): string | undefined => {
        const shouldShowError =
            formik.touched[fieldName] || formik.submitCount > 0;

        if (!shouldShowError) {
            return undefined;
        }

        const formikError = formik.errors[fieldName];
        if (formikError) {
            return formikError as string;
        }

        const serverError = serverErrors[fieldName];
        if (serverError && serverError.length > 0) {
            return serverError[0];
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
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl w-11/12 max-w-5xl flex overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0, y: -50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="hidden md:block md:w-1/2 bg-brand">
                                <img
                                    src="https://cdni.iconscout.com/illustration/premium/thumb/online-registration-illustration-svg-download-png-3723270.png"
                                    alt="Register"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="w-full md:w-1/2 p-6 relative flex flex-col">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 focus:outline-none"
                                >
                                    <X size={20} />
                                </button>

                                <h2 className="text-xl font-bold mb-4 text-gray-800">
                                    Create Account
                                </h2>

                                <div className="flex-1 overflow-y-auto pr-2">
                                    <form
                                        onSubmit={formik.handleSubmit}
                                        className="space-y-3"
                                    >
                                        {/* Full Name */}
                                        <div className="flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Full Name{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="John Doe"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                    getErrorMessage("name")
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                            {getErrorMessage("name") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("name")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Email{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="you@example.com"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                    getErrorMessage("email")
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                            {getErrorMessage("email") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("email")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone & Department */}
                                        <div className="flex gap-3">
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Phone{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formik.values.phone}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    placeholder="9876543210"
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage("phone")
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                />
                                                {getErrorMessage("phone") && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "phone",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Department{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    name="department"
                                                    value={
                                                        formik.values.department
                                                    }
                                                    onChange={
                                                        handleDepartmentChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage(
                                                            "department",
                                                        )
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                >
                                                    <option value="">
                                                        Select Department
                                                    </option>
                                                    {loadingLocations.departments ? (
                                                        <option disabled>
                                                            Loading...
                                                        </option>
                                                    ) : (
                                                        departments.map(
                                                            (dept) => (
                                                                <option
                                                                    key={
                                                                        dept.id
                                                                    }
                                                                    value={
                                                                        dept.name
                                                                    }
                                                                >
                                                                    {dept.name}
                                                                </option>
                                                            ),
                                                        )
                                                    )}
                                                </select>
                                                {getErrorMessage(
                                                    "department",
                                                ) && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "department",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password & Confirm Password */}
                                        <div className="flex gap-3">
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Password{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="password"
                                                        value={
                                                            formik.values
                                                                .password
                                                        }
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        placeholder="••••••••"
                                                        className={`w-full border rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none ${
                                                            getErrorMessage(
                                                                "password",
                                                            )
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword,
                                                            )
                                                        }
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff size={18} />
                                                        ) : (
                                                            <Eye size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                                {getErrorMessage(
                                                    "password",
                                                ) && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "password",
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Confirm Password{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="password_confirmation"
                                                        value={
                                                            formik.values
                                                                .password_confirmation
                                                        }
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        placeholder="••••••••"
                                                        className={`w-full border rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none ${
                                                            getErrorMessage(
                                                                "password_confirmation",
                                                            )
                                                                ? "border-red-500"
                                                                : "border-gray-300"
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword,
                                                            )
                                                        }
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff size={18} />
                                                        ) : (
                                                            <Eye size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Date of Birth{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <DatePicker
                                                    selected={
                                                        formik.values.dob
                                                            ? new Date(
                                                                  formik.values
                                                                      .dob,
                                                              )
                                                            : null
                                                    }
                                                    onChange={(
                                                        date: Date | null,
                                                    ) => {
                                                        if (date) {
                                                            const formattedDate =
                                                                date
                                                                    .toISOString()
                                                                    .split(
                                                                        "T",
                                                                    )[0];
                                                            formik.setFieldValue(
                                                                "dob",
                                                                formattedDate,
                                                            );
                                                        } else {
                                                            formik.setFieldValue(
                                                                "dob",
                                                                "",
                                                            );
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        formik.setFieldTouched(
                                                            "dob",
                                                            true,
                                                        );
                                                    }}
                                                    placeholderText="Select date of birth"
                                                    dateFormat="dd-MM-yyyy"
                                                    maxDate={
                                                        new Date(
                                                            new Date().setFullYear(
                                                                new Date().getFullYear() -
                                                                    18,
                                                            ),
                                                        )
                                                    }
                                                    showYearDropdown
                                                    showMonthDropdown
                                                    scrollableYearDropdown
                                                    scrollableMonthDropdown
                                                    yearDropdownItemNumber={100}
                                                    dropdownMode="select"
                                                    className={`w-full border rounded-lg px-3 py-2 pl-10 text-sm focus:outline-none ${
                                                        getErrorMessage("dob")
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                    wrapperClassName="w-full"
                                                />
                                                <Calendar
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                            </div>
                                            {getErrorMessage("dob") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("dob")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Address Line 1 */}
                                        <div className="flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Address Line 1{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address_line_1"
                                                value={
                                                    formik.values.address_line_1
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Street address"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                    getErrorMessage(
                                                        "address_line_1",
                                                    )
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            />
                                            {getErrorMessage(
                                                "address_line_1",
                                            ) && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage(
                                                        "address_line_1",
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {/* Address Line 2 & 3 */}
                                        <div className="flex gap-3">
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Address Line 2{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address_line_2"
                                                    value={
                                                        formik.values
                                                            .address_line_2
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    placeholder="Area/Locality"
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage(
                                                            "address_line_2",
                                                        )
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                />
                                                {getErrorMessage(
                                                    "address_line_2",
                                                ) && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "address_line_2",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Address Line 3{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address_line_3"
                                                    value={
                                                        formik.values
                                                            .address_line_3
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    placeholder="Landmark"
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage(
                                                            "address_line_3",
                                                        )
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                />
                                                {getErrorMessage(
                                                    "address_line_3",
                                                ) && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "address_line_3",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Country & State in same row */}
                                        <div className="flex gap-3">
                                            {/* Country */}
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Country{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    name="country"
                                                    value={
                                                        formik.values.country
                                                    }
                                                    onChange={
                                                        handleCountryChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage(
                                                            "country",
                                                        )
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                >
                                                    <option value="">
                                                        Select Country
                                                    </option>
                                                    {loadingLocations.countries ? (
                                                        <option disabled>
                                                            Loading...
                                                        </option>
                                                    ) : (
                                                        countries.map(
                                                            (country) => (
                                                                <option
                                                                    key={
                                                                        country.id
                                                                    }
                                                                    value={
                                                                        country.name
                                                                    }
                                                                >
                                                                    {
                                                                        country.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )
                                                    )}
                                                </select>
                                                {getErrorMessage("country") && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "country",
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {/* State */}
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    State{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    name="state"
                                                    value={formik.values.state}
                                                    onChange={handleStateChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage("state")
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                >
                                                    <option value="">
                                                        Select State
                                                    </option>
                                                    {loadingLocations.states ? (
                                                        <option disabled>
                                                            Loading...
                                                        </option>
                                                    ) : (
                                                        allStates.map(
                                                            (state) => (
                                                                <option
                                                                    key={
                                                                        state.id
                                                                    }
                                                                    value={
                                                                        state.name
                                                                    }
                                                                >
                                                                    {state.name}
                                                                </option>
                                                            ),
                                                        )
                                                    )}
                                                </select>
                                                {getErrorMessage("state") && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "state",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* City & Pincode in same row */}
                                        <div className="flex gap-3">
                                            {/* City */}
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    City{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    name="city"
                                                    value={formik.values.city}
                                                    onChange={handleCityChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage("city")
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                    disabled={!selectedStateId}
                                                >
                                                    <option value="">
                                                        Select City
                                                    </option>
                                                    {loadingLocations.cities ? (
                                                        <option disabled>
                                                            Loading...
                                                        </option>
                                                    ) : (
                                                        filteredCities.map(
                                                            (city) => (
                                                                <option
                                                                    key={
                                                                        city.id
                                                                    }
                                                                    value={
                                                                        city.name
                                                                    }
                                                                >
                                                                    {city.name}
                                                                </option>
                                                            ),
                                                        )
                                                    )}
                                                </select>
                                                {getErrorMessage("city") && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "city",
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Pincode */}
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-gray-700 mb-1 text-sm">
                                                    Pincode{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={
                                                        formik.values.pincode
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    placeholder="600001"
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                        getErrorMessage(
                                                            "pincode",
                                                        )
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                    }`}
                                                />
                                                {getErrorMessage("pincode") && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {getErrorMessage(
                                                            "pincode",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sign Up Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium focus:outline-none ${
                                                isSubmitting
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {isSubmitting
                                                ? "Signing up..."
                                                : "Sign Up"}
                                        </button>
                                    </form>
                                </div>

                                <p className="mt-4 text-center text-gray-500 text-sm">
                                    Already have an account?{" "}
                                    <span
                                        onClick={handleSignInClick}
                                        className="text-brand cursor-pointer focus:outline-none"
                                    >
                                        Sign In
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EmailVerificationModal
                isOpen={showEmailVerification}
                onClose={handleVerificationClose}
                email={registeredEmail}
                onVerified={handleVerificationSuccess}
            />
        </>
    );
}
