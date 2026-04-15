import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/stores/hooks";
import { fetchUserProfile } from "@/stores/slices/authSlice";
import { useNavigate } from "react-router-dom";
import api from "@/services/ApiService";
import {
    fetchCountries,
    fetchStates,
    fetchCities,
} from "@/stores/slices/locationSlice";
import { Alert } from "@/utils/Alert/Alert";
import {
    User,
    Shield,
    Mail,
    Phone,
    Calendar,
    Building2,
    Eye,
    EyeOff,
    CheckCircle,
    Save,
    X,
    Edit3,
    UserCircle,
    Globe,
    Hash,
    Briefcase,
    KeyRound,
    Lock,
    AlertCircle,
    Activity,
    MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAppSelector((state) => state.auth);

    // Get locations from Redux
    const countries = useAppSelector((state) => state.location.countries);
    const allStates = useAppSelector((state) => state.location.allStates);
    const allCities = useAppSelector((state) => state.location.allCities);
    const loadingLocations = useAppSelector((state) => state.location.loading);

    // Tab state
    const [activeTab, setActiveTab] = useState<"general" | "security">("general");

    // Profile editing state
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Selected IDs for API
    const [selectedCountryId, setSelectedCountryId] = useState<string>("");
    const [selectedStateId, setSelectedStateId] = useState<string>("");

    // Track if locations have been loaded
    const [countriesLoaded, setCountriesLoaded] = useState(false);
    const [statesLoaded, setStatesLoaded] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        address_line_3: "",
        country_name: "",
        state_name: "",
        city_name: "",
        pincode: "",
        dob: "",
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Filter cities based on selected state
    const filteredCities = allCities.filter(
        (city) => city.state_id.toString() === selectedStateId,
    );

    // Fetch user profile on mount
    useEffect(() => {
        if (!user) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, user]);

    // Fetch all countries ONCE when entering edit mode
    useEffect(() => {
        if (isEditing && !countriesLoaded) {
            if (countries.length === 0) {
                dispatch(fetchCountries()).then(() => {
                    setCountriesLoaded(true);
                });
            } else {
                setCountriesLoaded(true);
            }
        }
    }, [isEditing, dispatch, countries.length, countriesLoaded]);

    // Fetch all states ONCE when entering edit mode
    useEffect(() => {
        if (isEditing && !statesLoaded) {
            if (allStates.length === 0) {
                dispatch(fetchStates()).then(() => {
                    setStatesLoaded(true);
                });
            } else {
                setStatesLoaded(true);
            }
        }
    }, [isEditing, dispatch, allStates.length, statesLoaded]);

    // Populate form when user data is available
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                address_line_1: user.address_line_1 || "",
                address_line_2: user.address_line_2 || "",
                address_line_3: user.address_line_3 || "",
                country_name: user.country_name || "",
                state_name: user.state_name || "",
                city_name: user.city_name || "",
                pincode: user.pincode || "",
                dob: user.dob || "",
            });
            setSelectedCountryId(user.country_id?.toString() || "");
            setSelectedStateId(user.state_id?.toString() || "");
        }
    }, [user]);

    // Reset loaded flags when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setCountriesLoaded(false);
            setStatesLoaded(false);
            setSelectedCountryId("");
            setSelectedStateId("");
        }
    }, [isEditing]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryName = e.target.value;
        const country = countries.find((c) => c.name === countryName);
        const countryId = country?.id?.toString() || "";

        setSelectedCountryId(countryId);
        setSelectedStateId("");
        setFormData((prev) => ({
            ...prev,
            country_name: countryName,
            state_name: "",
            city_name: "",
        }));
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateName = e.target.value;
        const state = allStates.find((s) => s.name === stateName);
        const stateId = state?.id?.toString() || "";

        setSelectedStateId(stateId);
        setFormData((prev) => ({
            ...prev,
            state_name: stateName,
            city_name: "",
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        }

        if (formData.phone && formData.phone !== "null") {
            const phoneRegex =
                /^\+?(\d{1,3})?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
            if (!phoneRegex.test(formData.phone)) {
                newErrors.phone = "Invalid phone number format";
            }
        }

        if (formData.dob && formData.dob !== "null") {
            const selectedDate = new Date(formData.dob);
            const today = new Date();
            const maxDate = new Date();
            maxDate.setFullYear(today.getFullYear() - 15);
            if (selectedDate > maxDate) {
                newErrors.dob = "You must be at least 15 years old";
            }
        }

        if (
            formData.pincode &&
            formData.pincode !== "null" &&
            !/^\d+$/.test(formData.pincode)
        ) {
            newErrors.pincode = "Postcode must contain only numbers";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            let cityId = null;
            if (formData.city_name && selectedStateId) {
                const selectedCity = filteredCities.find(
                    (c) => c.name === formData.city_name,
                );
                if (selectedCity) {
                    cityId = selectedCity.id;
                }
            }

            const updatePayload: Record<string, any> = {};

            if (formData.name && formData.name !== "null")
                updatePayload.name = formData.name;
            if (formData.phone && formData.phone !== "null")
                updatePayload.phone = formData.phone;
            if (formData.address_line_1 && formData.address_line_1 !== "null")
                updatePayload.address_line_1 = formData.address_line_1;
            if (formData.address_line_2 && formData.address_line_2 !== "null")
                updatePayload.address_line_2 = formData.address_line_2;
            if (formData.address_line_3 && formData.address_line_3 !== "null")
                updatePayload.address_line_3 = formData.address_line_3;
            if (formData.pincode && formData.pincode !== "null")
                updatePayload.pincode = formData.pincode;
            if (formData.dob && formData.dob !== "null")
                updatePayload.dob = formData.dob;
            if (selectedCountryId)
                updatePayload.country_id = parseInt(selectedCountryId);
            if (selectedStateId)
                updatePayload.state_id = parseInt(selectedStateId);
            if (cityId) updatePayload.city_id = cityId;

            const response = await api.post(
                "/auth/profile/update",
                updatePayload,
            );

            if (response.data.status === "success") {
                await dispatch(fetchUserProfile());
                setIsEditing(false);
                Alert.Success("Profile updated successfully!");
            } else {
                throw new Error(
                    response.data.message || "Failed to update profile",
                );
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                Alert.Error("Please fix the validation errors");
            } else {
                Alert.Error(
                    error.response?.data?.message ||
                        error.message ||
                        "Failed to update profile. Please try again.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Password strength calculation
    const getPasswordStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        if (score <= 2)
            return {
                text: "Weak",
                color: "text-red-500",
                bg: "bg-red-500",
                width: "20%",
            };
        if (score <= 3)
            return {
                text: "Fair",
                color: "text-yellow-500",
                bg: "bg-yellow-500",
                width: "40%",
            };
        if (score <= 4)
            return {
                text: "Good",
                color: "text-blue-500",
                bg: "bg-blue-500",
                width: "70%",
            };
        return {
            text: "Strong",
            color: "text-green-500",
            bg: "bg-green-500",
            width: "100%",
        };
    };

    const passwordStrength = getPasswordStrength(passwordForm.new_password);

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validatePasswordForm = () => {
        const newErrors: Record<string, string> = {};

        if (!passwordForm.current_password) {
            newErrors.current_password = "Current password is required";
        }
        if (!passwordForm.new_password) {
            newErrors.new_password = "New password is required";
        } else if (passwordForm.new_password.length < 8) {
            newErrors.new_password = "Password must be at least 8 characters";
        }
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            newErrors.new_password_confirmation = "Passwords do not match";
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setIsChangingPassword(true);

        try {
            const response = await api.post("/auth/password-change", {
                current_password: passwordForm.current_password,
                password: passwordForm.new_password,
                password_confirmation: passwordForm.new_password_confirmation,
            });

            if (response.data.status === "success") {
                Alert.Success("Password changed successfully!");
                setPasswordForm({
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                });
                setPasswordErrors({});
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setPasswordErrors(error.response.data.errors);
            } else {
                Alert.Error(
                    error.response?.data?.message ||
                        "Failed to change password",
                );
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const togglePassword = (field: "current" | "new" | "confirm") => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const maskEmail = (email: string) => {
        if (!email) return "-";
        const [localPart, domain] = email.split("@");
        if (localPart.length <= 3) return email;
        return `${localPart.slice(0, 3)}***@${domain}`;
    };

    const maskPhone = (phone: string) => {
        if (!phone || phone === "null") return "-";
        if (phone.length <= 4) return phone;
        return phone.slice(0, 4) + "***" + phone.slice(-2);
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === "null") return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-slate-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
    );

    const FormField = ({ label, name, value, type = "text", placeholder, icon: Icon, readOnly = false, isSelect = false, options = [], error, onChange, disabled }: any) => (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">{label}</label>
            <div className="relative group">
                {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
                {isSelect ? (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange || handleInputChange}
                        disabled={!isEditing || readOnly || disabled}
                        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none
                            ${!isEditing || readOnly || disabled
                                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-900 dark:text-white'
                            } ${error ? 'border-red-500' : ''}`}
                    >
                        <option value="">{placeholder}</option>
                        {options.map((opt: any) => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange || handleInputChange}
                        disabled={!isEditing || readOnly}
                        placeholder={placeholder}
                        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none
                            ${!isEditing || readOnly 
                                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-900 dark:text-white'
                            } ${error ? 'border-red-500' : ''}`}
                    />
                )}
            </div>
            {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-700">
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-10">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/20">
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                <Shield size={14} className="text-indigo-500" /> {user?.role_name} • {user?.department_name}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {activeTab === "general" && (
                            !isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => {
                                        setIsEditing(false);
                                        setErrors({});
                                        if (user) {
                                            setFormData({
                                                name: user.name || "",
                                                phone: user.phone || "",
                                                address_line_1: user.address_line_1 || "",
                                                address_line_2: user.address_line_2 || "",
                                                address_line_3: user.address_line_3 || "",
                                                country_name: user.country_name || "",
                                                state_name: user.state_name || "",
                                                city_name: user.city_name || "",
                                                pincode: user.pincode || "",
                                                dob: user.dob || "",
                                            });
                                            setSelectedCountryId(user.country_id?.toString() || "");
                                            setSelectedStateId(user.state_id?.toString() || "");
                                        }
                                    }} className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Activity className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Navigation */}
                    <div className="lg:col-span-3">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                            {[
                                { id: "general", label: "General", icon: UserCircle },
                                { id: "security", label: "Security", icon: KeyRound },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as "general" | "security"); setIsEditing(false); }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                        ${activeTab === tab.id 
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === "general" ? (
                                <motion.div 
                                    key="general-tab"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Personal Details */}
                                    <section>
                                        <SectionHeader title="Personal Information" subtitle="Update your basic profile and contact details." />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Full Name" name="name" value={formData.name} icon={User} placeholder="Enter your name" error={errors.name} />
                                            <FormField label="Email Address" name="email" value={maskEmail(user?.email || "")} icon={Mail} readOnly />
                                            <FormField label="Phone Number" name="phone" value={formData.phone} icon={Phone} placeholder="+1 000 000 000" error={errors.phone} />
                                            <FormField label="Date of Birth" name="dob" value={formData.dob} icon={Calendar} type="date" error={errors.dob} />
                                        </div>
                                    </section>

                                    {/* Employment Details */}
                                    <section className="pt-8 border-slate-100 dark:border-slate-800">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField label="Current Role" name="role" value={user?.role_name} icon={Briefcase} readOnly />
                                            <FormField label="Department" name="dept" value={user?.department_name} icon={Building2} readOnly />
                                        </div>
                                    </section>

                                    {/* Address */}
                                    <section className="pt-8 border-slate-100 dark:border-slate-800">
                                        <div className="grid grid-cols-1 gap-6">
                                            <FormField label="Street Address" name="address_line_1" value={formData.address_line_1} icon={MapPin} placeholder="Suite, Street name" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormField label="Country" name="country_name" value={formData.country_name} isSelect={isEditing} options={countries} disabled={loadingLocations.countries} onChange={handleCountryChange} placeholder="Select Country" />
                                                <FormField label="State" name="state_name" value={formData.state_name} isSelect={isEditing} options={allStates} disabled={!selectedCountryId || loadingLocations.states} onChange={handleStateChange} placeholder="Select State" />
                                                <FormField label="City" name="city_name" value={formData.city_name} icon={Globe} isSelect={isEditing} options={filteredCities} disabled={!selectedStateId || loadingLocations.cities} placeholder="Select City" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField label="Address Line 2" name="address_line_2" value={formData.address_line_2} placeholder="Area/Locality" />
                                                <FormField label="Postcode" name="pincode" value={formData.pincode} icon={Hash} error={errors.pincode} placeholder="Postal code" />
                                            </div>
                                        </div>
                                    </section>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="security-tab"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="max-w-xl"
                                >
                                    <SectionHeader title="Security Settings" subtitle="Keep your account secure by updating your password regularly." />
                                    
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-slate-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <div className="space-y-4">
                                            {['current', 'new', 'confirm'].map((field) => (
                                                <div key={field} className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                                                        {field === 'confirm' ? 'Confirm New' : field} Password
                                                    </label>
                                                    <div className="relative">
                                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type={showPasswords[field as keyof typeof showPasswords] ? "text" : "password"}
                                                            name={field === 'confirm' ? 'new_password_confirmation' : `${field}_password`}
                                                            value={field === 'confirm' ? passwordForm.new_password_confirmation : passwordForm[`${field}_password` as keyof typeof passwordForm]}
                                                            onChange={handlePasswordInputChange}
                                                            className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-white dark:bg-slate-800 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all
                                                                ${passwordErrors[field === 'confirm' ? 'new_password_confirmation' : `${field}_password`] ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                                            }`}
                                                            placeholder="••••••••"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => togglePassword(field as "current" | "new" | "confirm")}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500"
                                                        >
                                                            {showPasswords[field as keyof typeof showPasswords] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                    {passwordErrors[field === 'confirm' ? 'new_password_confirmation' : `${field}_password`] && (
                                                        <p className="text-red-500 text-xs">{passwordErrors[field === 'confirm' ? 'new_password_confirmation' : `${field}_password`]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {passwordForm.new_password && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-slate-500">Password strength</span>
                                                    <span className={passwordStrength.color}>{passwordStrength.text}</span>
                                                </div>
                                                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${passwordStrength.bg} transition-all duration-300`} style={{ width: passwordStrength.width }} />
                                                </div>
                                            </div>
                                        )}

                                        <button 
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Lock size={18} />
                                            {isChangingPassword ? "Updating..." : "Update Password"}
                                        </button>

                                        <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                                            <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400 font-medium">
                                                For better security, your password should be at least 8 characters long and include a mix of uppercase letters, numbers, and symbols.
                                            </p>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
