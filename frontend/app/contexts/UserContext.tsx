import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { userService, type BackendUser } from "~/services/user.service";

export enum UserRole {
    Student = "Student",
    KPK = "KPK",
    Teacher = "Prowadzący",
    Admin = "Administrator",
    Coordinator = "Koordynator",
}

export interface User {
    role: UserRole;
    user_id?: number;
    name?: string;
}

interface UserContextType {
    user: User;
    setUser: (user: User) => void;
    hasRole: (...roles: UserRole[]) => boolean;
    users: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function mapBackendRole(role: string): UserRole {
    switch (role) {
        case "STUDENT":
            return UserRole.Student;
        case "TEACHER":
            return UserRole.Teacher;
        case "KPK_MEMBER":
            return UserRole.KPK;
        case "COORDINATOR":
            return UserRole.Coordinator;
        case "ADMIN":
            return UserRole.Admin;
        default:
            return UserRole.Student;
    }
}

export function UserProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User>(() => {
        if (typeof window !== "undefined") {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    if (parsed && parsed.role) {
                        return parsed;
                    }
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            }
        }
        // Default minimal user until API loads
        return { role: UserRole.KPK };
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const backendUsers: BackendUser[] = await userService.getAll();
                const mapped: User[] = backendUsers.map((u) => ({
                    user_id: u.user_id,
                    name: u.name ?? undefined,
                    role: mapBackendRole(u.role),
                }));
                if (!isMounted) return;
                setUsers(mapped);
                // If current user is placeholder or missing, set default to first fetched
                if (!user.user_id && mapped.length > 0) {
                    setUser(mapped[0]);
                }
            } catch (e) {
                console.error("Failed to fetch users", e);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    const hasRole = (...roles: UserRole[]) => {
        return roles.includes(user.role);
    };

    return (
        <UserContext.Provider value={{ user, setUser, hasRole, users }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
