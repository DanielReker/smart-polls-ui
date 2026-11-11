import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Box, Button, Card, CardContent, Container, Tab, Tabs, TextField, Typography} from '@mui/material';
import {useAuth} from "../auth/AuthContext.tsx";
import {useLocation, useNavigate} from "react-router";
import {isAxiosError} from "axios";

type AuthMode = 'login' | 'register';

interface AuthFormValues {
    login: string;
    password: string;
}

export const AuthPage = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const [mode, setMode] = useState<AuthMode>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register: formRegister, handleSubmit, formState: { errors } } = useForm<AuthFormValues>({
        defaultValues: { login: '', password: '' }
    });

    const onSubmit = async (data: AuthFormValues) => {
        setError(null);
        setIsLoading(true);
        try {
            if (mode === 'register') {
                await register(data.login, data.password);
            } else {
                await login(data.login, data.password);
            }
            navigate(from, { replace: true });
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === 401 || error.response?.status === 404) {
                    setError('Неверный логин или пароль');
                } else if (error.response?.status === 409) {
                    setError('Логин уже занят другим пользователем');
                } else {
                    setError('Ошибка сервера, пожалуйста, попробуйте позже');
                }
            } else {
                setError('Неизвестная ошибка');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={mode}
                        onChange={(_, newVal) => { setMode(newVal); setError(null); }}
                        variant="fullWidth"
                    >
                        <Tab label="Войти" value="login" />
                        <Tab label="Зарегистрироваться" value="register" />
                    </Tabs>
                </Box>

                <CardContent sx={{ pt: 3 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        {mode === 'login' ? 'С возвращением!' : 'Создать новый аккаунт'}
                    </Typography>

                    {mode === 'register' && (
                        <Typography variant="body2" color="text.secondary" align="center">
                            Зарегистрируйтесь, чтобы сохранить доступ к вашим тестам с любых устройств
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            label="Логин"
                            fullWidth
                            margin="normal"
                            {...formRegister('login', {
                                required: 'Придумайте логин',
                                minLength: { value: 5, message: 'Логин должен содержать не менее 5 символов' }
                            })}
                            error={!!errors.login}
                            helperText={errors.login?.message as string}
                        />

                        <TextField
                            label="Пароль"
                            type="password"
                            fullWidth
                            margin="normal"
                            {...formRegister('password', {
                                required: 'Придумайте пароль',
                                minLength: { value: 6, message: 'Пароль должен содержать не менее 5 символов' }
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message as string}
                        />

                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};