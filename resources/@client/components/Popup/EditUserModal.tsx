import React, { useEffect, useState } from "react";
import { X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
    fetchCountries,
    fetchStates,
    fetchCities,
    fetchDepartments,
} from "@/stores/slices/locationSlice";
import api from "@/services/ApiService";
import { Alert } from "@/utils/Alert/Alert";
import DatePicker from "react-datepicker";
import { User } from "@/pages/Management/UserManagement";

// ========== INTERFACES ==========
interface EditUserFormData {
    name: string;
    email: string;
    phone: string;
    dob: string;
    role_id: string;
    department_id: string;
    country_id: string;
    state_id: string;
    city_id: string;
    pincode: string;
    address_line_1: string;
    address_line_2: string;
    address_line_3: string;
    status: number;
}

interface Props {
    open: boolean;
    user: User | null;
    onClose: () => void;
}

// ========== VALIDATION SCHEMA ==========
const EditUserSchema = Yup.object().shape({
    name: Yup.string()
        .required("Full name is required")
        .max(255, "Name must not exceed 255 characters"),

    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format")
        .max(255, "Email must not exceed 255 characters"),

    phone: Yup.string()
        .required("Phone number is required")
        .max(20, "Phone number must not exceed 20 characters"),

    dob: Yup.date()
        .required("Date of birth is required")
        .max(
            new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
            "User must be at least 18 years old",
        )
        .typeError("Invalid date format"),

    role_id: Yup.string().required("Role is required"),

    department_id: Yup.string().required("Department is required"),

    country_id: Yup.string().required("Country is required"),

    state_id: Yup.string().required("State is required"),

    city_id: Yup.string().required("City is required"),

    pincode: Yup.string()
        .required("Pincode is required")
        .max(255, "Pincode must not exceed 255 characters"),

    address_line_1: Yup.string()
        .required("Address line 1 is required")
        .max(255, "Address line 1 must not exceed 255 characters"),

    address_line_2: Yup.string()
        .required("Address line 2 is required")
        .max(255, "Address line 2 must not exceed 255 characters"),

    address_line_3: Yup.string()
        .required("Address line 3 is required")
        .max(255, "Address line 3 must not exceed 255 characters"),

    status: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required("Status is required")
        .oneOf(
            [1, 2, 4],
            "Status must be either Active, Inactive, or Active (Password Unchanged)",
        ),
});

const EditUserModal: React.FC<Props> = ({ open, user, onClose }) => {
    // ========== STATE DECLARATIONS ==========
    const [serverErrors, setServerErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCountryId, setSelectedCountryId] = useState<string>("");
    const [selectedStateId, setSelectedStateId] = useState<string>("");

    // ========== REDUX HOOKS ==========
    const dispatch = useAppDispatch();
    const countries = useAppSelector((state) => state.location.countries);
    const allStates = useAppSelector((state) => state.location.allStates);
    const allCities = useAppSelector((state) => state.location.allCities);
    const departments = useAppSelector(
        (state) => state.location.allDepartments,
    );
    const roles = useAppSelector((state) => state.auth.roles);
    const loadingLocations = useAppSelector((state) => state.location.loading);
    const loadingRoles = useAppSelector((state) => state.auth.loading?.roles);

    const filteredCities = allCities.filter(
        (city) => city.state_id.toString() === selectedStateId,
    );

    // ========== LOAD DATA WHEN MODAL OPENS ==========
    useEffect(() => {
        if (open) {
            if (countries.length === 0) dispatch(fetchCountries());
            if (allStates.length === 0) dispatch(fetchStates());
            if (allCities.length === 0) dispatch(fetchCities());
            if (departments.length === 0) dispatch(fetchDepartments());
        }
    }, [
        open,
        dispatch,
        countries.length,
        allStates.length,
        allCities.length,
        departments.length,
    ]);

    // ========== FORM VALIDATION WITH FORMIK ==========
    const formik = useFormik<EditUserFormData>({
        initialValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            dob: user?.dob || "",
            role_id: user?.role_id?.toString() || "",
            department_id: user?.department_id?.toString() || "",
            country_id: user?.country_id?.toString() || "",
            state_id: user?.state_id?.toString() || "",
            city_id: user?.city_id?.toString() || "",
            pincode: user?.pincode || "",
            address_line_1: user?.address_line_1 || "",
            address_line_2: user?.address_line_2 || "",
            address_line_3: user?.address_line_3 || "",
            status: user?.status ? Number(user.status) : 1,
        },
        validationSchema: EditUserSchema,
        validateOnChange: false,
        validateOnBlur: true,
        validateOnMount: false,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            setServerErrors({});
            setIsSubmitting(true);

            // Explicitly parse status as integer to guarantee a number
            const statusValue = parseInt(String(values.status), 10);

            const payload = {
                id: user?.id,
                name: values.name,
                email: values.email,
                phone: values.phone || null,
                dob: values.dob || null,
                role_id: parseInt(values.role_id),
                department_id: values.department_id
                    ? parseInt(values.department_id)
                    : null,
                country_id: parseInt(selectedCountryId),
                state_id: parseInt(selectedStateId),
                city_id: parseInt(values.city_id),
                pincode: values.pincode || null,
                address_line_1: values.address_line_1 || null,
                address_line_2: values.address_line_2 || null,
                address_line_3: values.address_line_3 || null,
                status: statusValue,
            };

            try {
                console.log(
                    "Status value:",
                    values.status,
                    "Type:",
                    typeof values.status,
                );
                console.log("Payload status:", statusValue);
                const response = await api.post(
                    "/auth/user-update",
                    payload,
                );

                if (response.data.status === "success") {
                    Alert.Success("User updated successfully");
                    onClose();
                } else {
                    throw new Error(
                        response.data.message || "Failed to update user",
                    );
                }
            } catch (error: any) {
                console.error("Error updating user:", error);

                if (
                    error.response?.status === 422 &&
                    error.response?.data?.errors
                ) {
                    const backendErrors = error.response.data.errors;
                    setServerErrors(backendErrors);

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
                            "Failed to update user. Please try again.",
                    );
                }
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    // ========== RESET FORM ON MODAL OPEN ==========
    useEffect(() => {
        if (open && user) {
            console.log(user);
            setSelectedCountryId(user.country_id?.toString() || "");
            setSelectedStateId(user.state_id?.toString() || "");
            formik.resetForm({
                values: {
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    dob: user.dob || "",
                    role_id: user.role_id?.toString() || "",
                    department_id: user.department_id?.toString() || "",
                    country_id: user.country_id?.toString() || "",
                    state_id: user.state_id?.toString() || "",
                    city_id: user.city_id?.toString() || "",
                    pincode: user.pincode || "",
                    address_line_1: user.address_line_1 || "",
                    address_line_2: user.address_line_2 || "",
                    address_line_3: user.address_line_3 || "",
                    status: user.status ? Number(user.status) : 1,
                },
            });
            setServerErrors({});
        }
    }, [open, user]);

    // ========== HANDLE COUNTRY CHANGE ==========
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryId = e.target.value;
        setSelectedCountryId(countryId);
        setSelectedStateId("");
        formik.setFieldValue("country_id", countryId);
        formik.setFieldValue("state_id", "");
        formik.setFieldValue("city_id", "");
    };

    // ========== HANDLE STATE CHANGE ==========
    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateId = e.target.value;
        setSelectedStateId(stateId);
        formik.setFieldValue("state_id", stateId);
        formik.setFieldValue("city_id", "");
    };

    // ========== GET ERROR MESSAGE ==========
    const getErrorMessage = (
        fieldName: keyof EditUserFormData,
    ): string | undefined => {
        const shouldShowError =
            formik.touched[fieldName] || formik.submitCount > 0;

        if (!shouldShowError) return undefined;

        const formikError = formik.errors[fieldName];
        if (formikError) return formikError as string;

        const serverError = serverErrors[fieldName];
        if (serverError && serverError.length > 0) return serverError[0];

        return undefined;
    };

    return (
        <AnimatePresence>
            {open && user && (
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
                        {/* Left Side */}
                        <div className="hidden md:block md:w-1/2 bg-brand">
                            <img
                                src="https://cdni.iconscout.com/illustration/premium/thumb/online-registration-illustration-svg-download-png-3723270.png"
                                alt="Edit User"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Right Side: Form */}
                        <div className="w-full md:w-1/2 p-6 relative flex flex-col">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 focus:outline-none"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold mb-2 text-gray-800">
                                Edit User
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Update user account information.
                            </p>

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
                                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("name") ? "border-red-500" : "border-gray-300"}`}
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
                                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("email") ? "border-red-500" : "border-gray-300"}`}
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
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="9876543210"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("phone") ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {getErrorMessage("phone") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("phone")}
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
                                                name="department_id"
                                                value={
                                                    formik.values.department_id
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("department_id") ? "border-red-500" : "border-gray-300"}`}
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>
                                                {loadingLocations.departments ? (
                                                    <option disabled>
                                                        Loading...
                                                    </option>
                                                ) : (
                                                    departments.map((dept) => (
                                                        <option
                                                            key={dept.id}
                                                            value={dept.id.toString()}
                                                        >
                                                            {dept.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {getErrorMessage(
                                                "department_id",
                                            ) && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage(
                                                        "department_id",
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role & Status */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Role{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                name="role_id"
                                                value={formik.values.role_id}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("role_id") ? "border-red-500" : "border-gray-300"}`}
                                            >
                                                <option value="">
                                                    Select Role
                                                </option>
                                                {loadingRoles ? (
                                                    <option disabled>
                                                        Loading...
                                                    </option>
                                                ) : (
                                                    roles.map((role) => (
                                                        <option
                                                            key={role.id}
                                                            value={role.id.toString()}
                                                        >
                                                            {role.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {getErrorMessage("role_id") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("role_id")}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Status{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                name="status"
                                                value={formik.values.status}
                                                onChange={(e) => {
                                                    const value = parseInt(
                                                        e.target.value,
                                                        10,
                                                    );
                                                    formik.setFieldValue(
                                                        "status",
                                                        value,
                                                    );
                                                }}
                                                onBlur={formik.handleBlur}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                                                    getErrorMessage("status")
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                <option value={1}>
                                                    Active
                                                </option>
                                                <option value={2}>
                                                    Inactive
                                                </option>
                                                <option value={4}>
                                                    Active (Password Unchanged)
                                                </option>
                                            </select>
                                            {getErrorMessage("status") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("status")}
                                                </p>
                                            )}
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
                                                              formik.values.dob,
                                                          )
                                                        : null
                                                }
                                                onChange={(
                                                    date: Date | null,
                                                ) => {
                                                    formik.setFieldValue(
                                                        "dob",
                                                        date
                                                            ? date
                                                                  .toISOString()
                                                                  .split("T")[0]
                                                            : "",
                                                    );
                                                }}
                                                onBlur={() =>
                                                    formik.setFieldTouched(
                                                        "dob",
                                                        true,
                                                    )
                                                }
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
                                                className={`w-full border rounded-lg px-3 py-2 pl-10 text-sm focus:outline-none ${getErrorMessage("dob") ? "border-red-500" : "border-gray-300"}`}
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
                                            value={formik.values.address_line_1}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Street address"
                                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("address_line_1") ? "border-red-500" : "border-gray-300"}`}
                                        />
                                        {getErrorMessage("address_line_1") && (
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
                                                    formik.values.address_line_2
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Area/Locality"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("address_line_2") ? "border-red-500" : "border-gray-300"}`}
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
                                                    formik.values.address_line_3
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Landmark"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("address_line_3") ? "border-red-500" : "border-gray-300"}`}
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

                                    {/* Country & State */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Country{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                name="country_id"
                                                value={formik.values.country_id}
                                                onChange={handleCountryChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("country_id") ? "border-red-500" : "border-gray-300"}`}
                                            >
                                                <option value="">
                                                    Select Country
                                                </option>
                                                {loadingLocations.countries ? (
                                                    <option disabled>
                                                        Loading...
                                                    </option>
                                                ) : (
                                                    countries.map((country) => (
                                                        <option
                                                            key={country.id}
                                                            value={country.id.toString()}
                                                        >
                                                            {country.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {getErrorMessage("country_id") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage(
                                                        "country_id",
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                State{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                name="state_id"
                                                value={formik.values.state_id}
                                                onChange={handleStateChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("state_id") ? "border-red-500" : "border-gray-300"}`}
                                            >
                                                <option value="">
                                                    Select State
                                                </option>
                                                {loadingLocations.states ? (
                                                    <option disabled>
                                                        Loading...
                                                    </option>
                                                ) : (
                                                    allStates.map((state) => (
                                                        <option
                                                            key={state.id}
                                                            value={state.id.toString()}
                                                        >
                                                            {state.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {getErrorMessage("state_id") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage(
                                                        "state_id",
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* City & Pincode */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 flex flex-col">
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                City{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                name="city_id"
                                                value={formik.values.city_id}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!selectedStateId}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("city_id") ? "border-red-500" : "border-gray-300"}`}
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
                                                                key={city.id}
                                                                value={city.id.toString()}
                                                            >
                                                                {city.name}
                                                            </option>
                                                        ),
                                                    )
                                                )}
                                            </select>
                                            {getErrorMessage("city_id") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("city_id")}
                                                </p>
                                            )}
                                        </div>

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
                                                value={formik.values.pincode}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="600001"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${getErrorMessage("pincode") ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {getErrorMessage("pincode") && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {getErrorMessage("pincode")}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium focus:outline-none ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            {isSubmitting
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditUserModal;
