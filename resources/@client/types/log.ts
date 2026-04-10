export interface AuditLogItem {
    id: number;

    client_id: number | string;

    module: string;
    action: string;

    message: string;

    status: "Success" | "Failed" | "Warning";

    created_at: string;
    ip_address: string;
    full_ip?: string;
    email: string;
    purpose: string;

    old_value?: string;
    new_value?: string;
    custom1?: string;
    custom2?: string;
}
