import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

export enum UserRole {
    Student = "Student",
    KPK = "KPK",
    Prowadzący = "Prowadzący",
    Administrator = "Administrator",
    Koordynator = "Koordynator",
}

export interface User {
    role: UserRole;
}

interface UserContextType {
    user: User;
    setUser: (user: User) => void;
    hasRole: (...roles: UserRole[]) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const mockUsers: User[] = [
    { role: UserRole.Student },
    { role: UserRole.KPK },
    { role: UserRole.Prowadzący },
    { role: UserRole.Administrator },
    { role: UserRole.Koordynator },
];

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(mockUsers[0]); // Default to Student

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
