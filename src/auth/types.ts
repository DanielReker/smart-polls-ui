export interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    logout: () => void;
}