export type BackendUser = {
    user_id: number;
    name: string | null;
    role: string; // e.g., "STUDENT", "TEACHER", "KPK_MEMBER", "ADMIN", "COORDINATOR"
};

export class UserService {
    private baseUrl = "http://localhost:5000/api/users";

    async getAll(): Promise<BackendUser[]> {
        const res = await fetch(this.baseUrl);
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
    }
}

export const userService = new UserService();
