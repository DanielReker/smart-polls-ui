import {createContext, useContext} from "react";
import type {UserResponse} from "../api/model";

export interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    logout: () => void;
    register: (login: string, password: string) => void;
    login: (login: string, password: string) => void;
    userMe: UserResponse | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};