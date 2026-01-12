import {createContext, useContext} from "react";

export interface AuthContextType {
    isAuthenticated: boolean;
    isRegistered: boolean;
    isAdmin: boolean;
    token: string | null;
    userLogin: string | null;
    logout: () => void;
    register: (login: string, password: string) => Promise<void>;
    login: (login: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};