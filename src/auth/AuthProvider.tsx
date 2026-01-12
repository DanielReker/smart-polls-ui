import {type ReactNode, useEffect, useState} from 'react';
import {
    getGetUserMeQueryKey,
    useCreateUser,
    useGetUserMe,
    useLogin,
    useUpdateCredentials
} from "../api/generated/user-controller/user-controller.ts";
import {AuthContext} from "./AuthContext.tsx";
import {useQueryClient} from "@tanstack/react-query";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('poll_token'));

    const queryClient = useQueryClient();

    const { mutateAsync: createUser, isPending } = useCreateUser();

    const { data: userMe } = useGetUserMe();

    const { mutateAsync: loginRaw } = useLogin()

    const { mutateAsync: updateCredentials } = useUpdateCredentials();

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

    const login = (login: string, password: string) => {
        loginRaw({userLogin: login, data: {password}})
            .then(response => setToken(response.token))
    };

    const register = (login: string, password: string) => {
        updateCredentials({data: {newPassword: password, newLogin: login}})
            .then(() => queryClient.invalidateQueries({queryKey: getGetUserMeQueryKey()}))
     }

    if (!token && isPending) {
        return <div>Initializing session...</div>;
    }

    return (
        <AuthContext value={{
            isAuthenticated: !!token,
            token,
            logout,
            login,
            register,
            userMe: userMe ? userMe : null,
        }}>
            {children}
        </AuthContext>
    );
};
