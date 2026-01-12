import {type ReactNode, useEffect, useState} from 'react';
import {
    getGetUserMeQueryKey,
    useCreateUser,
    useGetUserMe,
    useLogin,
    useLogout,
    useUpdateCredentials
} from "../api/generated/user-controller/user-controller.ts";
import {AuthContext} from "./AuthContext.tsx";
import {useQueryClient} from "@tanstack/react-query";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('poll_token'));

    const queryClient = useQueryClient();

    const { mutateAsync: logoutCurrentSession } = useLogout();

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

    const logout = async () => {
        await logoutCurrentSession();
        localStorage.removeItem('poll_token');
        setToken(null);
        await queryClient.invalidateQueries({ queryKey: getGetUserMeQueryKey() });
    };

    const login = async (login: string, password: string) => {
        try {
            const response = await loginRaw({ userLogin: login, data: { password } });
            const newToken = response.token;
            localStorage.setItem('poll_token', newToken);
            setToken(newToken);
            await queryClient.invalidateQueries({ queryKey: getGetUserMeQueryKey() });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const register = async (login: string, password: string) => {
        await updateCredentials({data: {newPassword: password, newLogin: login}})
        await queryClient.invalidateQueries({queryKey: getGetUserMeQueryKey()})
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
            isAdmin: userMe?.roles?.includes('ADMIN') || false,
            isRegistered: userMe?.isRegistered || false,
            userLogin: userMe?.login || null
        }}>
            {children}
        </AuthContext>
    );
};
