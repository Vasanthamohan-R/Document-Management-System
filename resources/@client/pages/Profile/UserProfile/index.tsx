// pages/Profile.tsx
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

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAppSelector((state) => state.auth);

    // Get locations from Redux
    const countries = useAppSelector((state) => state.location.countries);
    const allStates = useAppSelector((state) => state.location.allStates);
    const allCities = useAppSelector((state) => state.location.allCities);
    const loadingLocations = useAppSelector((state) => state.location.loading);

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Selected IDs for API (like RegisterModal)
    const [selectedCountryId, setSelectedCountryId] = useState<string>("");
    const [selectedStateId, setSelectedStateId] = useState<string>("");

    // Track if locations have been loaded
    const [countriesLoaded, setCountriesLoaded] = useState(false);
    const [statesLoaded, setStatesLoaded] = useState(false);

    // Form data - Store NAMES for display, IDs separately (like RegisterModal)
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

    // Handle country change (like RegisterModal)
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryName = e.target.value;
        const country = countries.find((c) => c.name === countryName);
        const countryId = country?.id?.toString() || "";

        setSelectedCountryId(countryId);
        setSelectedStateId(""); // Reset state
        setFormData((prev) => ({
            ...prev,
            country_name: countryName,
            state_name: "",
            city_name: "",
        }));
    };

    // Handle state change (like RegisterModal)
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

    // Validation function
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
        console.log("handleSaveProfile called");

        if (!validateForm()) {
            console.log("Validation failed");
            return;
        }

        console.log("Validation passed, sending API call");
        setIsSubmitting(true);

        try {
            // Find city ID from selected city name
            let cityId = null;
            if (formData.city_name && selectedStateId) {
                const selectedCity = filteredCities.find(
                    (c) => c.name === formData.city_name,
                );
                if (selectedCity) {
                    cityId = selectedCity.id;
                }
            }

            // Prepare updatePayload
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

            console.log("Sending payload:", updatePayload);

            const response = await api.post(
                "/auth/profile/update",
                updatePayload,
            );

            console.log("Update response:", response.data);

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
            console.error("Save error:", error);
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

    const handleChangePassword = () => {
        navigate("/change-password");
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen px-6 py-6">
            {/* PROFILE HEADER */}
            <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {user?.name || "User Name"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {maskEmail(user?.email || "")}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                {user?.role_name || "Role"}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                {user?.department_name || "Department"}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    Change Password
                </button>
            </div>

            {/* PROFILE INFORMATION CARD */}
            <div className="bg-white rounded-2xl shadow p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold">
                        Profile Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Full Name */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Full Name
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-900">
                                    {user?.name || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Email - Read Only */}
                    <div className="flex items-center py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                E-mail
                            </label>
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-900">
                                {maskEmail(user?.email || "")}
                            </span>
                        </div>
                    </div>

                    {/* Mobile No */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Mobile No.
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                                        placeholder="0123456789"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.phone}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-900">
                                    {maskPhone(user?.phone || "")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* DOB */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">DOB</label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dob ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.dob && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.dob}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-900">
                                    {formatDate(user?.dob || "")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Role - Read Only */}
                    <div className="flex items-center py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Role
                            </label>
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-900">
                                {user?.role_name || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Department - Read Only */}
                    <div className="flex items-center py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Department
                            </label>
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-900">
                                {user?.department_name || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Address Line 1 */}
                    <div className="flex items-start py-2 border-b border-gray-200 md:col-span-2">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Address Line 1
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address_line_1"
                                    value={formData.address_line_1}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Street address"
                                />
                            ) : (
                                <span className="text-gray-900">
                                    {user?.address_line_1 || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex items-start py-2 border-b border-gray-200 md:col-span-2">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Address Line 2
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address_line_2"
                                    value={formData.address_line_2}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Area/Locality"
                                />
                            ) : (
                                <span className="text-gray-900">
                                    {user?.address_line_2 || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Address Line 3 */}
                    <div className="flex items-start py-2 border-b border-gray-200 md:col-span-2">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Address Line 3
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address_line_3"
                                    value={formData.address_line_3}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Landmark"
                                />
                            ) : (
                                <span className="text-gray-900">
                                    {user?.address_line_3 || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Country Dropdown */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Country
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <select
                                    name="country_name"
                                    value={formData.country_name}
                                    onChange={handleCountryChange}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loadingLocations.countries}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option
                                            key={country.id}
                                            value={country.name}
                                        >
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-gray-900">
                                    {user?.country_name || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* State Dropdown */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                State
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <select
                                    name="state_name"
                                    value={formData.state_name}
                                    onChange={handleStateChange}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loadingLocations.states}
                                >
                                    <option value="">Select State</option>
                                    {allStates.map((state) => (
                                        <option
                                            key={state.id}
                                            value={state.name}
                                        >
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-gray-900">
                                    {user?.state_name || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* City Dropdown - Filtered by selected state */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                City
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <select
                                    name="city_name"
                                    value={formData.city_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={
                                        !selectedStateId ||
                                        loadingLocations.cities
                                    }
                                >
                                    <option value="">Select City</option>
                                    {filteredCities.map((city) => (
                                        <option key={city.id} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-gray-900">
                                    {user?.city_name || "-"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Postcode */}
                    <div className="flex items-start py-2 border-b border-gray-200">
                        <div className="w-32">
                            <label className="text-sm text-gray-500">
                                Postcode
                            </label>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pincode ? "border-red-500" : "border-gray-300"}`}
                                        placeholder="Postal code"
                                    />
                                    {errors.pincode && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.pincode}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-900">
                                    {user?.pincode || "-"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* BUTTONS SECTION - MOVED TO BOTTOM */}
                <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setErrors({});
                                    if (user) {
                                        setFormData({
                                            name: user.name || "",
                                            phone: user.phone || "",
                                            address_line_1:
                                                user.address_line_1 || "",
                                            address_line_2:
                                                user.address_line_2 || "",
                                            address_line_3:
                                                user.address_line_3 || "",
                                            country_name:
                                                user.country_name || "",
                                            state_name: user.state_name || "",
                                            city_name: user.city_name || "",
                                            pincode: user.pincode || "",
                                            dob: user.dob || "",
                                        });
                                        setSelectedCountryId(
                                            user.country_id?.toString() || "",
                                        );
                                        setSelectedStateId(
                                            user.state_id?.toString() || "",
                                        );
                                    }
                                }}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
                            >
                                {isSubmitting ? "Saving..." : "Update Profile"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
