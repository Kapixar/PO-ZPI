import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

export type UserRole = "Student" | "KPK" | "Prowadzący";

export interface User {
    role: UserRole;
}

interface UserContextType {
    user: User;
    setUser: (user: User) => void;
    hasRole: (role: UserRole | UserRole[]) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users for testing
export const mockUsers: User[] = [
    { role: "Student" },
    { role: "KPK" },
    { role: "Prowadzący" },
];

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(mockUsers[0]); // Default to Student

    const hasRole = (role: UserRole | UserRole[]) => {
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
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
