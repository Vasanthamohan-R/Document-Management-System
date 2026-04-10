export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role_name: string; // ← Use role_name instead of role
    department_name: string; // ← Use department_name instead of department
    status: string;
    dob?: string;
    address_line_1?: string;
    address_line_2?: string;
    address_line_3?: string;
    country_name?: string;
    state_name?: string;
    city_name?: string;
    pincode?: string;
    created_at: string;
    updated_at: string;

    // IDs for API calls
    role_id?: number;
    department_id?: number;
    country_id?: number;
    state_id?: number;
    city_id?: number;
}

// Form data type (without auto-generated fields)
export interface UserFormData {
    name: string;
    email: string;
    phone?: string;
    dob?: string;
    role_id: string;
    department_id?: string;
    country_id?: string;
    state_id?: string;
    city_id?: string;
    pincode?: string;
    address_line_1?: string;
    address_line_2?: string;
    address_line_3?: string;
}
