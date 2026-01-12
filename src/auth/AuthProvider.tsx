import {type ReactNode, useEffect, useState} from 'react';
import {useCreateUser} from "../api/generated/user-controller/user-controller.ts";
import {AuthContext} from "./AuthContext.tsx";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('poll_token'));

    const { mutateAsync: createUser, isPending } = useCreateUser();

    useEffect(() => {
        const initSession = async () => {
            if (!token) {
                try {
                    const response = await createUser();
                    const newToken = response.token;

                    localStorage.setItem('poll_token', newToken);
                    setToken(newToken);
                } catch (error) {
                    console.error('Failed to init anonymous session', error);
                }
            }
        };

        initSession();
    }, [token, createUser]);

    const logout = () => {
        localStorage.removeItem('poll_token');
        setToken(null);
    };

    if (!token && isPending) {
        return <div>Initializing session...</div>;
    }

    return (
        <AuthContext value={{ isAuthenticated: !!token, token, logout }}>
            {children}
        </AuthContext>
    );
};
