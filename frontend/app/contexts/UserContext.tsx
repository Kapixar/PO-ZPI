import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const mockUsers: User[] = [
    { role: UserRole.Student, user_id: 48, name: "student 48" },
    { role: UserRole.Student, user_id: 43, name: "student 43" },
    { role: UserRole.KPK, user_id: 3 },
    { role: UserRole.Teacher, user_id: 5, name: "anna nowak" },
    { role: UserRole.Teacher, user_id: 6, name: "piotr kowalski" },
    { role: UserRole.Admin, user_id: 1 },
    { role: UserRole.Coordinator, user_id: 2 },
];

export function UserProvider({ children }: { children: ReactNode }) {
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
        return mockUsers[0]; // Default to Student
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    const hasRole = (...roles: UserRole[]) => {
        return roles.includes(user.role);
    };

    return (
        <UserContext.Provider value={{ user, setUser, hasRole }}>
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
